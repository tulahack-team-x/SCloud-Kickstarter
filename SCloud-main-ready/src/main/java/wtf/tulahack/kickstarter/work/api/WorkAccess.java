package wtf.tulahack.kickstarter.work.api;

import wtf.tulahack.kickstarter.shared.model.Actor;

public interface WorkAccess {
    OrderContext requireParticipant(Actor actor, String orderId);

    OrderContext requireCustomer(Actor actor, String orderId);

    OrderContext requireTeamOwner(Actor actor, String orderId);
}
