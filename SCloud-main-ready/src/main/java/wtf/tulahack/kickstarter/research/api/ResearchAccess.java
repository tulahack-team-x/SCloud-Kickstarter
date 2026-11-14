package wtf.tulahack.kickstarter.research.api;

import wtf.tulahack.kickstarter.shared.model.Actor;

public interface ResearchAccess {
    void requireRead(Actor actor, String projectId);

    void requireWrite(Actor actor, String projectId);
}
