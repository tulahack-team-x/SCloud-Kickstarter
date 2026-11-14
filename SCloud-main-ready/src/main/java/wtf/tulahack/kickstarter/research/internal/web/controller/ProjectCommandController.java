package wtf.tulahack.kickstarter.research.internal.web.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import wtf.tulahack.kickstarter.research.api.ResearchCatalog.ProjectView;
import wtf.tulahack.kickstarter.research.internal.application.ProjectService;
import wtf.tulahack.kickstarter.research.internal.web.ResearchResponses;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.net.URI;
import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class ProjectCommandController {
    private final ReadCache readCache;
    private final ProjectService projects;
    private final CurrentActorProvider actors;

    @GetMapping("/api/me/projects")
    public PageSlice<ProjectView> own(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "ProjectCommandController.own",
                () -> PageSlice.from(projects.list(actor, true, null, null), offset, limit),
                actor.id(),
                offset,
                limit);
    }

    @PostMapping("/api/projects")
    public Callable<ResponseEntity<ProjectView>> create(
            @Valid @RequestBody ProjectService.Draft request) {
        Actor actor = actors.require();
        return () -> {
            ProjectView project = projects.create(actor, request);
            return ResponseEntity.created(URI.create("/api/projects/" + project.id()))
                    .body(project);
        };
    }

    @PutMapping("/api/projects/{id}")
    public Callable<ProjectView> update(
            @PathVariable String id, @Valid @RequestBody Update request) {
        Actor actor = actors.require();
        return () -> projects.update(actor, id, request.project(), request.expectedVersion());
    }

    @PostMapping("/api/projects/{id}/publication")
    public Callable<ProjectView> publish(
            @PathVariable String id, @Valid @RequestBody Version request) {
        Actor actor = actors.require();
        return () -> projects.publish(actor, id, request.expectedVersion());
    }

    @GetMapping("/api/projects/{id}/updates")
    public PageSlice<ResearchResponses.Update> updates(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.optional();
        return readCache.get(
                "ProjectCommandController.updates",
                () ->
                        PageSlice.from(
                                projects.updates(actor, id).stream()
                                        .map(ResearchResponses::from)
                                        .toList(),
                                offset,
                                limit),
                actor == null ? null : actor.id(),
                id,
                offset,
                limit);
    }

    @PostMapping("/api/projects/{id}/updates")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<ResearchResponses.Update> update(
            @PathVariable String id, @Valid @RequestBody ProjectService.UpdateDraft request) {
        Actor actor = actors.require();
        return () -> ResearchResponses.from(projects.addUpdate(actor, id, request));
    }

    @PostMapping("/api/projects/{id}/read-grants")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<ResearchResponses.Grant> grant(
            @PathVariable String id, @Valid @RequestBody Grant request) {
        Actor actor = actors.require();
        return () -> ResearchResponses.from(projects.grantRead(actor, id, request.userId()));
    }

    @DeleteMapping("/api/projects/{id}/read-grants/{grantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Callable<Void> revoke(@PathVariable String id, @PathVariable String grantId) {
        Actor actor = actors.require();
        return () -> {
            projects.revokeRead(actor, id, grantId);
            return null;
        };
    }

    public record Grant(@NotBlank String userId) {}

    public record Version(@PositiveOrZero long expectedVersion) {}

    public record Update(
            @NotNull @Valid ProjectService.Draft project, @PositiveOrZero long expectedVersion) {}
}
