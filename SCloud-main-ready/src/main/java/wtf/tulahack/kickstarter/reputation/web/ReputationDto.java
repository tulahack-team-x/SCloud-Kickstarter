package wtf.tulahack.kickstarter.reputation.web;

import wtf.tulahack.kickstarter.reputation.domain.CooperationReview;

public record ReputationDto(
        String id,
        String orderId,
        String authorId,
        String subjectId,
        String subjectType,
        int rating,
        String text,
        String createdAt) {
    public static ReputationDto from(CooperationReview review) {
        return new ReputationDto(
                review.getId(),
                review.getOrderId(),
                review.getAuthorId(),
                review.getSubjectId(),
                review.getSubjectType(),
                review.getRating(),
                review.getText(),
                review.getCreatedAt());
    }
}
