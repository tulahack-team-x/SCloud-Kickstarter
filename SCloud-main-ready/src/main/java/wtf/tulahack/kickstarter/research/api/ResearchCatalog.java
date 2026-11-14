package wtf.tulahack.kickstarter.research.api;

import jakarta.validation.constraints.*;

import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.List;

public interface ResearchCatalog {
    ProjectView get(Actor actor, String projectId);

    List<ProjectView> list(Actor actor, boolean own, String query, String category);

    record StageDraft(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 5000) String result,
            @NotBlank @Size(max = 5000) String acceptance,
            @Min(1) @Max(520) int weeks,
            @Min(10000) @Max(1000000000) long budgetKopecks) {}

    record StageView(
            String id,
            int position,
            String title,
            String result,
            String acceptance,
            int weeks,
            long budgetKopecks) {}

    record ProjectView(
            String id,
            String organizationId,
            String title,
            String category,
            String summary,
            String hypothesis,
            String method,
            String result,
            String risks,
            String visibility,
            String status,
            long version,
            String createdAt,
            List<StageView> stages) {}
}
