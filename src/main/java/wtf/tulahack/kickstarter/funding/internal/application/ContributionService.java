package wtf.tulahack.kickstarter.funding.internal.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.funding.api.FundingSummary;
import wtf.tulahack.kickstarter.funding.api.FundingTotals;
import wtf.tulahack.kickstarter.funding.internal.domain.Contribution;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.util.List;

@Service
public class ContributionService implements FundingTotals {
    private final Database database;
    private final ResearchCatalog projects;

    private final boolean demoPayments;

    public ContributionService(
            Database database,
            ResearchCatalog projects,
            @Value("${app.demo-payments}") boolean demoPayments) {
        this.database = database;
        this.projects = projects;
        this.demoPayments = demoPayments;
    }

    public Contribution create(
            Actor actor, String projectId, long amountKopecks, String idempotencyKey) {
        if (actor.role() == AccountRole.RESEARCHER) {
            throw ApplicationException.forbidden();
        }
        if (amountKopecks < 10000
                || amountKopecks > 1000000000
                || idempotencyKey == null
                || !idempotencyKey.matches("[A-Za-z0-9_-]{8,80}")) {
            throw ApplicationException.invalid(
                    "Сумма: от 100 до 10 000 000 рублей; нужен Idempotency-Key от 8 до 80"
                            + " символов");
        }
        return database.write(
                () -> {
                    String requestKey = actor.id() + ":" + idempotencyKey;
                    Contribution existing =
                            database.find(Contribution.class, "requestKey", requestKey).stream()
                                    .findFirst()
                                    .orElse(null);
                    if (existing != null) {
                        if (!existing.getProjectId().equals(projectId)
                                || existing.getAmountKopecks() != amountKopecks) {
                            throw ApplicationException.conflict(
                                    "Ключ уже использован для другого взноса");
                        }
                        return existing;
                    }
                    ResearchCatalog.ProjectView project = projects.get(actor, projectId);
                    if (!"PUBLIC".equals(project.visibility())
                            || !"PUBLISHED".equals(project.status())) {
                        throw ApplicationException.conflict(
                                "Поддержать можно открытый опубликованный проект");
                    }
                    Contribution contribution = new Contribution();
                    contribution.setProjectId(projectId);
                    contribution.setUserId(actor.id());
                    contribution.setAmountKopecks(amountKopecks);
                    contribution.setStatus("PENDING");
                    contribution.setRequestKey(requestKey);
                    return database.insert(contribution);
                });
    }

    public Contribution confirmDemo(Actor actor, String id) {
        if (!demoPayments) {
            throw ApplicationException.notFound();
        }
        return database.write(
                () -> {
                    Contribution contribution = database.get(Contribution.class, id);
                    if (!contribution.getUserId().equals(actor.id())) {
                        throw ApplicationException.notFound();
                    }
                    return contribution.confirm() ? database.update(contribution) : contribution;
                });
    }

    public List<Contribution> own(Actor actor) {
        return database.find(Contribution.class, "userId", actor.id());
    }

    @Override
    public FundingSummary forProject(String projectId) {
        return summarize(database.find(Contribution.class, "projectId", projectId));
    }

    @Override
    public FundingSummary forUser(String userId) {
        return summarize(database.find(Contribution.class, "userId", userId));
    }

    private FundingSummary summarize(List<Contribution> contributions) {
        List<Contribution> confirmed =
                contributions.stream()
                        .filter(contribution -> "CONFIRMED".equals(contribution.getStatus()))
                        .toList();
        long total =
                confirmed.stream()
                        .mapToLong(Contribution::getAmountKopecks)
                        .reduce(0L, Math::addExact);
        return new FundingSummary(
                total,
                confirmed.stream().map(Contribution::getUserId).distinct().count(),
                confirmed.size());
    }
}
