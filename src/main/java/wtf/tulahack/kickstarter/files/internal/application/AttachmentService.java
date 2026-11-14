package wtf.tulahack.kickstarter.files.internal.application;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.files.api.AttachmentOwner;
import wtf.tulahack.kickstarter.files.api.Attachments;
import wtf.tulahack.kickstarter.files.internal.domain.Attachment;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttachmentService implements Attachments {
    private final Database database;
    private final ResourceAccess access;
    private final BinaryObjectStorage storage;

    public Attachment upload(
            Actor actor,
            AttachmentOwner owner,
            String originalName,
            long size,
            InputStream contents)
            throws IOException {
        access.requireWrite(actor, owner);
        if (size <= 0
                || size > 10 * 1024 * 1024
                || originalName == null
                || originalName.isBlank()) {
            throw ApplicationException.invalid("Нужен файл размером от 1 байта до 10 МБ");
        }
        String name = originalName.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "");
        if (name.isBlank() || name.length() > 200) {
            throw ApplicationException.invalid("Некорректное имя файла");
        }
        Attachment attachment = new Attachment();
        attachment.setUploaderId(actor.id());
        attachment.setOwnerType(owner.type());
        attachment.setOwnerId(owner.id());
        attachment.setName(name);
        attachment.setSize(size);
        attachment.setContentType("application/octet-stream");
        storage.store(attachment.getId(), contents);
        try {
            return database.write(
                    () -> {
                        access.requireWrite(actor, owner);
                        return database.insert(attachment);
                    });
        } catch (RuntimeException exception) {
            try {
                storage.delete(attachment.getId());
            } catch (IOException cleanupException) {
                exception.addSuppressed(cleanupException);
            }
            throw exception;
        }
    }

    public List<Attachment> list(Actor actor, AttachmentOwner owner) {
        access.requireRead(actor, owner);
        return database.find(Attachment.class, "ownerId", owner.id()).stream()
                .filter(attachment -> attachment.getOwnerType().equals(owner.type()))
                .toList();
    }

    public Download download(Actor actor, String id) {
        Attachment attachment = database.get(Attachment.class, id);
        access.requireRead(
                actor, new AttachmentOwner(attachment.getOwnerType(), attachment.getOwnerId()));
        return new Download(attachment.getName(), storage.read(attachment.getId()));
    }

    @Override
    public void requireReadyFor(Actor actor, AttachmentOwner owner, List<String> attachmentIds) {
        access.requireRead(actor, owner);
        if (new HashSet<>(attachmentIds).size() != attachmentIds.size()) {
            throw ApplicationException.invalid("Файлы не должны повторяться");
        }
        for (String id : attachmentIds) {
            Attachment attachment = database.get(Attachment.class, id);
            if (!attachment.getOwnerId().equals(owner.id())
                    || !attachment.getOwnerType().equals(owner.type())) {
                throw ApplicationException.notFound();
            }
        }
    }

    public record Download(String name, Resource resource) {}
}
