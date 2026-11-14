package wtf.tulahack.kickstarter.files.internal.application;

import wtf.tulahack.kickstarter.files.api.AttachmentOwner;
import wtf.tulahack.kickstarter.shared.model.Actor;

public interface ResourceAccess {
    void requireRead(Actor actor, AttachmentOwner owner);

    void requireWrite(Actor actor, AttachmentOwner owner);
}
