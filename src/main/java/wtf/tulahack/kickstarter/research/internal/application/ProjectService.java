package wtf.tulahack.kickstarter.research.internal.application;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.research.api.ResearchAccess;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectReadGrant;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectStage;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectUpdate;
import wtf.tulahack.kickstarter.research.internal.domain.ResearchProject;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProjectService implements ResearchCatalog, ResearchAccess {
    private final Database database;
    private final Organizations organizations;
    private final Accounts accounts;

    public ProjectView create(Actor actor, Draft draft) {
        actor.requireRole(AccountRole.RESEARCHER);
        return database.write(
                () -> {
                    organizations.requireOwner(actor, draft.organizationId());
                    if (!"SCIENTIFIC".equals(organizations.get(draft.organizationId()).type())) {
                        throw ApplicationException.invalid("Выберите научную команду");
                    }
                    ResearchProject project = new ResearchProject();
                    project.setOrganizationId(draft.organizationId());
                    project.setStatus("DRAFT");
                    apply(project, draft);
                    database.insert(project);
                    replaceStages(project.getId(), draft.stages());
                    return view(project);
                });
    }

    public ProjectView update(Actor actor, String id, Draft draft, long expectedVersion) {
        return database.write(
                () -> {
                    requireWrite(actor, id);
                    ResearchProject project = database.get(ResearchProject.class, id);
                    project.requireVersion(expectedVersion);
                    project.requireDraft();
                    if (!project.getOrganizationId().equals(draft.organizationId())) {
                        throw ApplicationException.invalid("Нельзя сменить команду проекта");
                    }
                    apply(project, draft);
                    database.update(project);
                    replaceStages(id, draft.stages());
                    return view(project);
                });
    }

    public ProjectView publish(Actor actor, String id, long expectedVersion) {
        return database.write(
                () -> {
                    requireWrite(actor, id);
                    ResearchProject project = database.get(ResearchProject.class, id);
                    project.requireVersion(expectedVersion);
                    project.requireDraft();
                    if (stages(id).isEmpty()) {
                        throw ApplicationException.invalid("Добавьте этап исследования");
                    }
                    project.publish();
                    return view(database.update(project));
                });
    }

    @Override
    public ProjectView get(Actor actor, String projectId) {
        requireRead(actor, projectId);
        return view(database.get(ResearchProject.class, projectId));
    }

    @Override
    public List<ProjectView> list(Actor actor, boolean own, String query, String category) {
        String search = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return database.all(ResearchProject.class).stream()
                .filter(
                        project ->
                                own
                                        ? organizations.isMember(actor, project.getOrganizationId())
                                        : isPublic(project))
                .filter(
                        project ->
                                search.isEmpty()
                                        || (project.getTitle() + " " + project.getSummary())
                                                .toLowerCase(Locale.ROOT)
                                                .contains(search))
                .filter(
                        project ->
                                category == null
                                        || category.isBlank()
                                        || category.equals(project.getCategory()))
                .map(this::view)
                .toList();
    }

    @Override
    public void requireRead(Actor actor, String id) {
        ResearchProject project = database.get(ResearchProject.class, id);
        boolean granted =
                actor != null
                        && database.find(ProjectReadGrant.class, "projectId", id).stream()
                                .anyMatch(grant -> grant.getUserId().equals(actor.id()));
        if (!isPublic(project)
                && !organizations.isMember(actor, project.getOrganizationId())
                && !granted) {
            throw ApplicationException.notFound();
        }
    }

    @Override
    public void requireWrite(Actor actor, String id) {
        organizations.requireOwner(
                actor, database.get(ResearchProject.class, id).getOrganizationId());
    }

    public ProjectUpdate addUpdate(Actor actor, String id, UpdateDraft draft) {
        return database.write(
                () -> {
                    requireWrite(actor, id);
                    ResearchProject project = database.get(ResearchProject.class, id);
                    if (!"PUBLISHED".equals(project.getStatus())) {
                        throw ApplicationException.conflict("Сначала опубликуйте проект");
                    }
                    ProjectStage stage = database.get(ProjectStage.class, draft.stageId());
                    if (!stage.getProjectId().equals(id)) {
                        throw ApplicationException.notFound();
                    }
                    ProjectUpdate update = new ProjectUpdate();
                    update.setProjectId(id);
                    update.setStageId(stage.getId());
                    update.setTitle(draft.title().trim());
                    update.setText(draft.text().trim());
                    update.setCompleted(draft.completed());
                    return database.insert(update);
                });
    }

    public List<ProjectUpdate> updates(Actor actor, String id) {
        requireRead(actor, id);
        return database.find(ProjectUpdate.class, "projectId", id);
    }

    public ProjectReadGrant grantRead(Actor actor, String projectId, String userId) {
        return database.write(
                () -> {
                    requireWrite(actor, projectId);
                    accounts.get(userId);
                    String key = projectId + ":" + userId;
                    ProjectReadGrant existing =
                            database.find(ProjectReadGrant.class, "grantKey", key).stream()
                                    .findFirst()
                                    .orElse(null);
                    if (existing != null) {
                        return existing;
                    }
                    ProjectReadGrant grant = new ProjectReadGrant();
                    grant.setProjectId(projectId);
                    grant.setUserId(userId);
                    grant.setGrantKey(key);
                    return database.insert(grant);
                });
    }

    public void revokeRead(Actor actor, String projectId, String grantId) {
        database.write(
                () -> {
                    requireWrite(actor, projectId);
                    ProjectReadGrant grant = database.get(ProjectReadGrant.class, grantId);
                    if (!grant.getProjectId().equals(projectId)) {
                        throw ApplicationException.notFound();
                    }
                    database.delete(grant);
                    return null;
                });
    }

    private boolean isPublic(ResearchProject project) {
        return "PUBLISHED".equals(project.getStatus()) && "PUBLIC".equals(project.getVisibility());
    }

    private List<ProjectStage> stages(String projectId) {
        return database.find(ProjectStage.class, "projectId", projectId).stream()
                .sorted(Comparator.comparingInt(ProjectStage::getPosition))
                .toList();
    }

    private void apply(ResearchProject project, Draft draft) {
        project.setTitle(draft.title().trim());
        project.setCategory(draft.category().trim());
        project.setSummary(draft.summary().trim());
        project.setHypothesis(draft.hypothesis().trim());
        project.setMethod(draft.method().trim());
        project.setResult(draft.result().trim());
        project.setRisks(draft.risks().trim());
        project.setVisibility(draft.visibility());
    }

    private void replaceStages(String id, List<StageDraft> drafts) {
        stages(id).forEach(database::delete);
        for (int position = 0; position < drafts.size(); position++) {
            StageDraft draft = drafts.get(position);
            ProjectStage stage = new ProjectStage();
            stage.setProjectId(id);
            stage.setPosition(position);
            stage.setTitle(draft.title().trim());
            stage.setResult(draft.result().trim());
            stage.setAcceptance(draft.acceptance().trim());
            stage.setWeeks(draft.weeks());
            stage.setBudgetKopecks(draft.budgetKopecks());
            database.insert(stage);
        }
    }

    private ProjectView view(ResearchProject project) {
        List<StageView> stageViews =
                stages(project.getId()).stream()
                        .map(
                                stage ->
                                        new StageView(
                                                stage.getId(),
                                                stage.getPosition(),
                                                stage.getTitle(),
                                                stage.getResult(),
                                                stage.getAcceptance(),
                                                stage.getWeeks(),
                                                stage.getBudgetKopecks()))
                        .toList();
        return new ProjectView(
                project.getId(),
                project.getOrganizationId(),
                project.getTitle(),
                project.getCategory(),
                project.getSummary(),
                project.getHypothesis(),
                project.getMethod(),
                project.getResult(),
                project.getRisks(),
                project.getVisibility(),
                project.getStatus(),
                project.getVersion(),
                project.getCreatedAt(),
                stageViews);
    }

    public record Draft(
            @NotBlank String organizationId,
            @NotBlank @Size(min = 8, max = 200) String title,
            @NotBlank @Size(max = 100) String category,
            @NotBlank @Size(min = 30, max = 5000) String summary,
            @NotBlank @Size(min = 10, max = 5000) String hypothesis,
            @NotBlank @Size(min = 10, max = 5000) String method,
            @NotBlank @Size(min = 10, max = 5000) String result,
            @NotBlank @Size(min = 10, max = 5000) String risks,
            @NotNull @Pattern(regexp = "PUBLIC|PRIVATE") String visibility,
            @NotEmpty @Size(max = 20) List<@Valid StageDraft> stages) {}

    public record UpdateDraft(
            @NotBlank String stageId,
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 10000) String text,
            boolean completed) {}
}
