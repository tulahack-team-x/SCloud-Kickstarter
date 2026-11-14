package wtf.tulahack.kickstarter.composition.files;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import wtf.tulahack.kickstarter.files.api.AttachmentOwner;
import wtf.tulahack.kickstarter.files.internal.application.ResourceAccess;
import wtf.tulahack.kickstarter.research.api.ResearchAccess;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.work.api.WorkAccess;

@Component
@RequiredArgsConstructor
public class ResourcesAccessAdapter implements ResourceAccess {
    private final ResearchAccess projects;
    private final WorkAccess orders;

    @Override
    public void requireRead(Actor actor, AttachmentOwner owner) {
        switch (owner.type()) {
            case "PROJECT" -> projects.requireRead(actor, owner.id());
            case "ORDER" -> orders.requireParticipant(actor, owner.id());
            default -> throw ApplicationException.invalid("Тип вложения: PROJECT или ORDER");
        }
    }

    @Override
    public void requireWrite(Actor actor, AttachmentOwner owner) {
        switch (owner.type()) {
            case "PROJECT" -> projects.requireWrite(actor, owner.id());
            case "ORDER" -> orders.requireTeamOwner(actor, owner.id());
            default -> throw ApplicationException.invalid("Тип вложения: PROJECT или ORDER");
        }
    }
}
