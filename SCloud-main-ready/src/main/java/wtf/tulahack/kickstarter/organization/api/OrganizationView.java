package wtf.tulahack.kickstarter.organization.api;

import java.util.List;

public record OrganizationView(
        String id,
        String ownerId,
        String name,
        String type,
        String institution,
        String city,
        String direction,
        String description,
        String skills,
        String equipment,
        long version,
        List<MemberView> members) {
    public record MemberView(
            String id, String userId, String name, String position, String accessRole) {}
}
