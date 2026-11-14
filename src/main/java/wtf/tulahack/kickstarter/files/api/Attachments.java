package wtf.tulahack.kickstarter.files.api;

import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.List;

public interface Attachments {
    void requireReadyFor(Actor actor, AttachmentOwner owner, List<String> attachmentIds);
}
