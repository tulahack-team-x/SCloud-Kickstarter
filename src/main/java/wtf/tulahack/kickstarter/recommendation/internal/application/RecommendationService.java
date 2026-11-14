package wtf.tulahack.kickstarter.recommendation.internal.application;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final Organizations organizations;
    private final ResearchCatalog research;
    private final RecommendationGateway gateway;
    private final ObjectMapper json;

    public CompletableFuture<RecommendationResult> recommend(Actor actor, RecommendationTask task) {
        if (actor.role() == AccountRole.RESEARCHER) {
            throw ApplicationException.forbidden();
        }
        Set<String> terms = terms(task);
        Map<String, List<String>> projects =
                research.list(actor, false, null, null).stream()
                        .filter(
                                project ->
                                        "PUBLIC".equals(project.visibility())
                                                && "PUBLISHED".equals(project.status()))
                        .collect(
                                Collectors.groupingBy(
                                        ResearchCatalog.ProjectView::organizationId,
                                        Collectors.mapping(
                                                project -> "Заявленный проект: " + project.title(),
                                                Collectors.toList())));
        List<RecommendationCandidate> candidates =
                organizations.list().stream()
                        .filter(organization -> "SCIENTIFIC".equals(organization.type()))
                        .sorted(
                                Comparator.comparingInt(
                                                (OrganizationView organization) ->
                                                        relevance(organization, terms))
                                        .reversed()
                                        .thenComparing(OrganizationView::id))
                        .limit(20)
                        .map(
                                organization ->
                                        candidate(
                                                organization,
                                                projects.getOrDefault(
                                                        organization.id(), List.of())))
                        .collect(Collectors.toList());
        while (!candidates.isEmpty()
                && json.writeValueAsBytes(Map.of("task", task, "candidates", candidates)).length
                        > 64 * 1024) {
            candidates.remove(candidates.size() - 1);
        }
        if (candidates.isEmpty()) {
            return CompletableFuture.completedFuture(new RecommendationResult(null));
        }
        List<RecommendationCandidate> shortlist = List.copyOf(candidates);
        return gateway.select(task, shortlist)
                .thenApply(
                        organizationId -> {
                            if (organizationId == null) {
                                return new RecommendationResult(null);
                            }
                            if (shortlist.stream()
                                    .noneMatch(
                                            candidate ->
                                                    candidate
                                                            .organizationId()
                                                            .equals(organizationId))) {
                                throw new ApplicationException(
                                        HttpStatus.BAD_GATEWAY,
                                        "INVALID_RECOMMENDATION",
                                        "Сервис выбрал команду вне списка");
                            }
                            OrganizationView organization = organizations.get(organizationId);
                            if (!"SCIENTIFIC".equals(organization.type())) {
                                throw ApplicationException.conflict(
                                        "Данные команды изменились. Повторите подбор");
                            }
                            return new RecommendationResult(organization);
                        });
    }

    private RecommendationCandidate candidate(
            OrganizationView organization, List<String> projects) {
        String direction =
                organization.direction() == null || organization.direction().isBlank()
                        ? "Не указано"
                        : clip(organization.direction(), 300);
        return new RecommendationCandidate(
                organization.id(),
                organization.name(),
                direction,
                clip(organization.description(), 2000),
                tags(organization.skills()),
                tags(organization.equipment()),
                projects.stream().limit(3).map(project -> clip(project, 300)).toList());
    }

    private List<String> tags(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split("[,;\\n]"))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .limit(10)
                .map(tag -> clip(tag, 300))
                .toList();
    }

    private String clip(String value, int length) {
        return value == null ? "" : value.substring(0, Math.min(value.length(), length));
    }

    private Set<String> terms(RecommendationTask task) {
        return Stream.concat(
                        Stream.of(task.description()),
                        Stream.concat(
                                task.mandatoryRequirements().stream(), task.preferences().stream()))
                .flatMap(
                        text ->
                                Arrays.stream(
                                        text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+")))
                .filter(word -> word.length() >= 4)
                .map(word -> word.substring(0, Math.min(5, word.length())))
                .collect(Collectors.toSet());
    }

    private int relevance(OrganizationView organization, Set<String> terms) {
        String profile =
                String.join(
                                " ",
                                String.valueOf(organization.direction()),
                                String.valueOf(organization.skills()),
                                String.valueOf(organization.equipment()),
                                String.valueOf(organization.description()))
                        .toLowerCase(Locale.ROOT);
        return (int) terms.stream().filter(profile::contains).count();
    }
}
