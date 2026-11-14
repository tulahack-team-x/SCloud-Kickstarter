package wtf.tulahack.kickstarter.files.internal.web;

import wtf.tulahack.kickstarter.files.internal.domain.Attachment;

public record AttachmentDto(
        String id, String ownerType, String ownerId, String name, long size, String createdAt) {
    public static AttachmentDto from(Attachment attachment) {
        return new AttachmentDto(
                attachment.getId(),
                attachment.getOwnerType(),
                attachment.getOwnerId(),
                attachment.getName(),
                attachment.getSize(),
                attachment.getCreatedAt());
    }
}
