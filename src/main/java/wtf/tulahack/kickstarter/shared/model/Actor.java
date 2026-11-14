package wtf.tulahack.kickstarter.shared.model;

import wtf.tulahack.kickstarter.shared.error.ApplicationException;

public record Actor(String id, AccountRole role) {
    public void requireRole(AccountRole expectedRole) {
        if (role != expectedRole) {
            throw ApplicationException.forbidden();
        }
    }
}
