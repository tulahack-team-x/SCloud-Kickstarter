package wtf.tulahack.kickstarter.research.internal.web;

import wtf.tulahack.kickstarter.research.internal.domain.ProjectReadGrant;
import wtf.tulahack.kickstarter.research.internal.domain.ProjectUpdate;

public final class ResearchResponses {
    private ResearchResponses() {}

    public static Update from(ProjectUpdate update) {
        return new Update(
                update.getId(),
                update.getProjectId(),
                update.getStageId(),
                update.getTitle(),
                update.getText(),
                update.isCompleted(),
                update.getCreatedAt());
    }

    public static Grant from(ProjectReadGrant grant) {
        return new Grant(grant.getId(), grant.getProjectId(), grant.getUserId());
    }

    public record Update(
            String id,
            String projectId,
            String stageId,
            String title,
            String text,
            boolean completed,
            String createdAt) {}

    public record Grant(String id, String projectId, String userId) {}
}
