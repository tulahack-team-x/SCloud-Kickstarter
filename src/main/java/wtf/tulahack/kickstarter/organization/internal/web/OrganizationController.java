package wtf.tulahack.kickstarter.organization.internal.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.util.concurrent.Callable;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final ReadCache readCache;
    private final Organizations organizations;
    private final CurrentActorProvider actors;

    @GetMapping
    public PageSlice<OrganizationView> list(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        return readCache.get(
                "OrganizationController.list",
                () -> PageSlice.from(organizations.list(), offset, limit),
                offset,
                limit);
    }

    @GetMapping("/{id}")
    public OrganizationView get(@PathVariable String id) {
        return readCache.get("OrganizationController.get", () -> organizations.get(id), id);
    }

    @PatchMapping("/{id}")
    public Callable<OrganizationView> update(
            @PathVariable String id, @Valid @RequestBody Update request) {
        Actor actor = actors.require();
        return () -> organizations.update(actor, id, request.team(), request.expectedVersion());
    }

    @GetMapping("/{id}/members")
    public PageSlice<OrganizationView.MemberView> members(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        return readCache.get(
                "OrganizationController.members",
                () -> PageSlice.from(organizations.get(id).members(), offset, limit),
                id,
                offset,
                limit);
    }

    @PostMapping("/{id}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<OrganizationView.MemberView> addMember(
            @PathVariable String id, @Valid @RequestBody Organizations.MemberDraft request) {
        Actor actor = actors.require();
        return () -> organizations.addMember(actor, id, request);
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Callable<Void> removeMember(@PathVariable String id, @PathVariable String memberId) {
        Actor actor = actors.require();
        return () -> {
            organizations.removeMember(actor, id, memberId);
            return null;
        };
    }

    public record Update(
            @Valid @jakarta.validation.constraints.NotNull Organizations.TeamDraft team,
            @PositiveOrZero long expectedVersion) {}
}
