package wtf.tulahack.kickstarter.composition.web.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import wtf.tulahack.kickstarter.identify.api.AccountView;
import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.util.List;
import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class MeController {
    private final ReadCache readCache;
    private final CurrentActorProvider actors;
    private final Accounts accounts;
    private final Organizations organizations;

    @GetMapping("/api/me")
    public Profile me() {
        Actor actor = actors.require();
        String userId = actor.id();
        return readCache.get(
                "MeController.me",
                () -> new Profile(accounts.get(userId), organizations.ownedBy(userId)),
                actor.id());
    }

    @PatchMapping("/api/me")
    public Callable<AccountView> rename(@Valid @RequestBody Rename request) {
        Actor actor = actors.require();
        return () -> accounts.rename(actor.id(), request.name());
    }

    public record Rename(@NotBlank @Size(min = 2, max = 100) String name) {}

    public record Profile(AccountView account, List<OrganizationView> organizations) {}
}
