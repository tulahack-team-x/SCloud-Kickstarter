package wtf.tulahack.kickstarter.composition.security;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import wtf.tulahack.kickstarter.identify.api.AccountView;
import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;

@Component
@RequiredArgsConstructor
public class SecurityContextActorProvider
        implements wtf.tulahack.kickstarter.shared.security.CurrentActorProvider {
    private final Accounts accounts;

    public Actor require() {
        Actor actor = optional();
        if (actor == null) {
            throw new ApplicationException(
                    HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Войдите в аккаунт");
        }
        return actor;
    }

    public Actor optional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        AccountView account = accounts.get(authentication.getName());
        return new Actor(account.id(), account.role());
    }
}
