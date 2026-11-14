package wtf.tulahack.kickstarter.identify.internal.security;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.identify.internal.domain.UserAccount;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountUserDetailsService implements UserDetailsService {
    private final Database database;

    @Override
    public UserDetails loadUserByUsername(String email) {
        UserAccount account =
                database
                        .find(UserAccount.class, "email", email.trim().toLowerCase(Locale.ROOT))
                        .stream()
                        .findFirst()
                        .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
        return User.withUsername(account.getId())
                .password(account.getPasswordHash())
                .roles(account.getRole().name())
                .build();
    }
}
