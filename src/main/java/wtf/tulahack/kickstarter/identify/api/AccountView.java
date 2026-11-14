package wtf.tulahack.kickstarter.identify.api;

import wtf.tulahack.kickstarter.shared.model.AccountRole;

public record AccountView(String id, String name, String email, AccountRole role) {}
