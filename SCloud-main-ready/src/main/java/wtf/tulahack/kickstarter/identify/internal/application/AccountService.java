package wtf.tulahack.kickstarter.identify.internal.application;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.identify.api.AccountView;
import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.identify.internal.domain.UserAccount;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AccountService implements Accounts {
    private final Database database;
    private final PasswordEncoder passwords;

    @Override
    public AccountView get(String userId) {
        return view(database.get(UserAccount.class, userId));
    }

    @Override
    public AccountView register(String name, String email, String password, AccountRole role) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!database.find(UserAccount.class, "email", normalizedEmail).isEmpty()) {
            throw ApplicationException.conflict("Email уже зарегистрирован");
        }
        UserAccount account = new UserAccount();
        account.setName(name.trim());
        account.setEmail(normalizedEmail);
        account.setPasswordHash(passwords.encode(password));
        account.setRole(role);
        return view(database.insert(account));
    }

    @Override
    public AccountView rename(String userId, String name) {
        return database.write(
                () -> {
                    UserAccount account = database.get(UserAccount.class, userId);
                    account.setName(name.trim());
                    return view(database.update(account));
                });
    }

    private AccountView view(UserAccount account) {
        return new AccountView(
                account.getId(), account.getName(), account.getEmail(), account.getRole());
    }
}
