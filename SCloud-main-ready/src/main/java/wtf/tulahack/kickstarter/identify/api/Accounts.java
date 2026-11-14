package wtf.tulahack.kickstarter.identify.api;

import wtf.tulahack.kickstarter.shared.model.AccountRole;

public interface Accounts {
    AccountView get(String userId);

    AccountView register(String name, String email, String password, AccountRole role);

    AccountView rename(String userId, String name);
}
