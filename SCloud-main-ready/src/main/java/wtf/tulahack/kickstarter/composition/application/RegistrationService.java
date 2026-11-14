package wtf.tulahack.kickstarter.composition.application;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.identify.api.AccountView;
import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final Database database;
    private final Accounts accounts;
    private final Organizations organizations;

    public AccountView register(Register command) {
        if (command.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw ApplicationException.invalid("Пароль должен занимать не больше 72 байт UTF-8");
        }
        if (command.role() == AccountRole.RESEARCHER && command.team() == null) {
            throw ApplicationException.invalid("Заполните данные научной команды");
        }
        if (command.role() != AccountRole.RESEARCHER && command.team() != null) {
            throw ApplicationException.invalid("Команду может создать только исследователь");
        }
        if (command.company() != null
                && !command.company().isBlank()
                && command.company().trim().length() < 3) {
            throw ApplicationException.invalid("Название компании: от 3 символов");
        }
        return database.write(
                () -> {
                    AccountView account =
                            accounts.register(
                                    command.name(),
                                    command.email(),
                                    command.password(),
                                    command.role());
                    Actor owner = new Actor(account.id(), account.role());
                    if (command.team() != null) {
                        organizations.createTeam(owner, command.team());
                    }
                    if (command.company() != null && !command.company().isBlank()) {
                        organizations.createCompany(owner, command.company());
                    }
                    return account;
                });
    }

    public record Register(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 10, max = 64) String password,
            @NotNull AccountRole role,
            @Valid Organizations.TeamDraft team,
            @Size(max = 150) String company) {
        @Override
        public String toString() {
            return "Register[role=" + role + "]";
        }
    }
}
