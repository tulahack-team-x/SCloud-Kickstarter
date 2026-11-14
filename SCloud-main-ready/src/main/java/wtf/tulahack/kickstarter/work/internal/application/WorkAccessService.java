package wtf.tulahack.kickstarter.work.internal.application;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.work.api.OrderContext;
import wtf.tulahack.kickstarter.work.api.WorkAccess;
import wtf.tulahack.kickstarter.work.internal.domain.OrderStage;
import wtf.tulahack.kickstarter.work.internal.domain.ResearchOrder;

@Service
@RequiredArgsConstructor
public class WorkAccessService implements WorkAccess {
    private final Database database;
    private final Organizations organizations;

    @Override
    public OrderContext requireParticipant(Actor actor, String orderId) {
        ResearchOrder order = database.get(ResearchOrder.class, orderId);
        if (actor == null
                || (!actor.id().equals(order.getCustomerId())
                        && !organizations.isMember(actor, order.getOrganizationId()))) {
            throw ApplicationException.notFound();
        }
        return context(order);
    }

    @Override
    public OrderContext requireCustomer(Actor actor, String orderId) {
        OrderContext context = requireParticipant(actor, orderId);
        if (!context.customerId().equals(actor.id())) {
            throw ApplicationException.forbidden();
        }
        return context;
    }

    @Override
    public OrderContext requireTeamOwner(Actor actor, String orderId) {
        OrderContext context = requireParticipant(actor, orderId);
        organizations.requireOwner(actor, context.organizationId());
        return context;
    }

    private OrderContext context(ResearchOrder order) {
        boolean accepted =
                database.find(OrderStage.class, "orderId", order.getId()).stream()
                        .anyMatch(stage -> "ACCEPTED".equals(stage.getStatus()));
        String companyId =
                organizations.ownedBy(order.getCustomerId()).stream()
                        .filter(organization -> "COMPANY".equals(organization.type()))
                        .map(OrganizationView::id)
                        .findFirst()
                        .orElse(null);
        return new OrderContext(
                order.getId(),
                order.getCustomerId(),
                order.getOrganizationId(),
                order.getStatus(),
                accepted,
                companyId);
    }
}
