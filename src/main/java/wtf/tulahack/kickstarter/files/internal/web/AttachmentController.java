package wtf.tulahack.kickstarter.files.internal.web;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import wtf.tulahack.kickstarter.files.api.AttachmentOwner;
import wtf.tulahack.kickstarter.files.internal.application.AttachmentService;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Callable;

@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
public class AttachmentController {
    private final ReadCache readCache;
    private final AttachmentService attachments;
    private final CurrentActorProvider actors;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<AttachmentDto> upload(
            @RequestParam String ownerType,
            @RequestParam String ownerId,
            @RequestParam MultipartFile file)
            throws IOException {
        Actor actor = actors.require();
        return () -> {
            try (var contents = file.getInputStream()) {
                return AttachmentDto.from(
                        attachments.upload(
                                actor,
                                new AttachmentOwner(ownerType, ownerId),
                                file.getOriginalFilename(),
                                file.getSize(),
                                contents));
            }
        };
    }

    @GetMapping
    public PageSlice<AttachmentDto> list(
            @RequestParam String ownerType,
            @RequestParam String ownerId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "AttachmentController.list",
                () ->
                        PageSlice.from(
                                attachments
                                        .list(actor, new AttachmentOwner(ownerType, ownerId))
                                        .stream()
                                        .map(AttachmentDto::from)
                                        .toList(),
                                offset,
                                limit),
                actor.id(),
                ownerType,
                ownerId,
                offset,
                limit);
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        AttachmentService.Download download = attachments.download(actors.require(), id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(download.name(), StandardCharsets.UTF_8)
                                .build()
                                .toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(download.resource());
    }
}
