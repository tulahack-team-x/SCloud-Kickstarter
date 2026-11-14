package wtf.tulahack.kickstarter.organization.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.List;

public interface Organizations {
    OrganizationView get(String id);

    List<OrganizationView> list();

    List<OrganizationView> ownedBy(String userId);

    OrganizationView createTeam(Actor owner, TeamDraft draft);

    OrganizationView createCompany(Actor owner, String name);

    OrganizationView update(Actor actor, String id, TeamDraft draft, long expectedVersion);

    OrganizationView.MemberView addMember(Actor actor, String id, MemberDraft draft);

    void removeMember(Actor actor, String id, String memberId);

    void requireOwner(Actor actor, String organizationId);

    boolean isMember(Actor actor, String organizationId);

    record MemberDraft(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Size(min = 2, max = 100) String position) {}

    record TeamDraft(
            @NotBlank @Size(min = 3, max = 150) String name,
            @Size(max = 200) String institution,
            @Size(max = 100) String city,
            @NotBlank @Size(max = 100) String direction,
            @NotBlank @Size(min = 20, max = 10000) String description,
            @Size(max = 2000) String skills,
            @Size(max = 2000) String equipment,
            @Size(max = 19) List<@Valid MemberDraft> members) {}
}
