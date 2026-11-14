package wtf.tulahack.kickstarter.shared.security;

import wtf.tulahack.kickstarter.shared.model.Actor;

public interface CurrentActorProvider {
    Actor require();

    Actor optional();
}
