package wtf.tulahack.kickstarter.reputation.application;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.reputation.domain.CooperationReview;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.work.api.OrderContext;
import wtf.tulahack.kickstarter.work.api.WorkAccess;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final Database database;
    private final WorkAccess work;
    private final Organizations organizations;

    public CooperationReview create(Actor actor, String orderId, int rating, String text) {
        return database.write(
                () -> {
                    OrderContext order = work.requireParticipant(actor, orderId);
                    if (!order.hasAcceptedStage()) {
                        throw ApplicationException.conflict(
                                "Отзыв доступен после приёмки хотя бы одного этапа");
                    }
                    boolean customer = actor.id().equals(order.customerId());
                    if (!customer) {
                        organizations.requireOwner(actor, order.organizationId());
                    }
                    String reviewKey = orderId + ":" + (customer ? "CUSTOMER" : "TEAM");
                    if (!database.find(CooperationReview.class, "reviewKey", reviewKey).isEmpty()) {
                        throw ApplicationException.conflict(
                                "Вы уже оставили отзыв по этому заказу");
                    }
                    CooperationReview review = new CooperationReview();
                    review.setOrderId(orderId);
                    review.setAuthorId(actor.id());
                    review.setReviewKey(reviewKey);
                    review.setSubjectId(
                            customer
                                    ? order.organizationId()
                                    : order.customerOrganizationId() == null
                                            ? order.customerId()
                                            : order.customerOrganizationId());
                    review.setSubjectType(
                            !customer && order.customerOrganizationId() == null
                                    ? "PRIVATE_CUSTOMER"
                                    : "ORGANIZATION");
                    review.setRating(rating);
                    review.setText(text.trim());
                    return database.insert(review);
                });
    }

    public List<CooperationReview> organizationReviews(String organizationId) {
        organizations.get(organizationId);
        return database.find(CooperationReview.class, "subjectId", organizationId).stream()
                .filter(review -> "ORGANIZATION".equals(review.getSubjectType()))
                .toList();
    }

    public List<CooperationReview> own(Actor actor) {
        return database.all(CooperationReview.class).stream()
                .filter(
                        review ->
                                review.getAuthorId().equals(actor.id())
                                        || review.getSubjectId().equals(actor.id())
                                        || organizations.ownedBy(actor.id()).stream()
                                                .anyMatch(
                                                        organization ->
                                                                organization
                                                                        .id()
                                                                        .equals(
                                                                                review
                                                                                        .getSubjectId())))
                .toList();
    }
}
