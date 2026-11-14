package wtf.tulahack.kickstarter.organization.internal.application;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.identify.api.Accounts;
import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.organization.internal.domain.Organization;
import wtf.tulahack.kickstarter.organization.internal.domain.OrganizationMember;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService implements Organizations {
    private final Database database;
    private final Accounts accounts;

    @Override
    public OrganizationView get(String id) {
        return view(database.get(Organization.class, id));
    }

    @Override
    public List<OrganizationView> list() {
        return database.all(Organization.class).stream().map(this::view).toList();
    }

    @Override
    public List<OrganizationView> ownedBy(String userId) {
        return database.find(Organization.class, "ownerId", userId).stream()
                .map(this::view)
                .toList();
    }

    @Override
    public OrganizationView createTeam(Actor owner, TeamDraft draft) {
        owner.requireRole(AccountRole.RESEARCHER);
        Organization organization = new Organization();
        organization.setOwnerId(owner.id());
        organization.setType("SCIENTIFIC");
        apply(organization, draft);
        database.insert(organization);
        addOwner(organization, owner.id());
        if (draft.members() != null) {
            draft.members().forEach(member -> insertMember(organization.getId(), member));
        }
        return view(organization);
    }

    @Override
    public OrganizationView createCompany(Actor owner, String name) {
        if (owner.role() == AccountRole.RESEARCHER) {
            throw ApplicationException.forbidden();
        }
        Organization organization = new Organization();
        organization.setOwnerId(owner.id());
        organization.setType("COMPANY");
        organization.setName(name.trim());
        database.insert(organization);
        addOwner(organization, owner.id());
        return view(organization);
    }

    @Override
    public OrganizationView update(Actor actor, String id, TeamDraft draft, long expectedVersion) {
        return database.write(
                () -> {
                    requireOwner(actor, id);
                    Organization organization = database.get(Organization.class, id);
                    organization.requireVersion(expectedVersion);
                    apply(organization, draft);
                    return view(database.update(organization));
                });
    }

    @Override
    public OrganizationView.MemberView addMember(Actor actor, String id, MemberDraft draft) {
        return database.write(
                () -> {
                    requireOwner(actor, id);
                    if (database.find(OrganizationMember.class, "organizationId", id).size()
                            >= 20) {
                        throw ApplicationException.conflict("В команде уже 20 участников");
                    }
                    return memberView(insertMember(id, draft));
                });
    }

    @Override
    public void removeMember(Actor actor, String id, String memberId) {
        database.write(
                () -> {
                    requireOwner(actor, id);
                    OrganizationMember member = database.get(OrganizationMember.class, memberId);
                    if (!member.getOrganizationId().equals(id)) {
                        throw ApplicationException.notFound();
                    }
                    if ("OWNER".equals(member.getAccessRole())) {
                        throw ApplicationException.conflict("Нельзя удалить владельца");
                    }
                    database.delete(member);
                    return null;
                });
    }

    @Override
    public void requireOwner(Actor actor, String organizationId) {
        if (actor == null || !get(organizationId).ownerId().equals(actor.id())) {
            throw ApplicationException.forbidden();
        }
    }

    @Override
    public boolean isMember(Actor actor, String organizationId) {
        if (actor == null) {
            return false;
        }
        return database.find(OrganizationMember.class, "organizationId", organizationId).stream()
                .anyMatch(member -> actor.id().equals(member.getUserId()));
    }

    private void apply(Organization organization, TeamDraft draft) {
        organization.setName(draft.name().trim());
        organization.setInstitution(draft.institution());
        organization.setCity(draft.city());
        organization.setDirection(draft.direction().trim());
        organization.setDescription(draft.description().trim());
        organization.setSkills(draft.skills());
        organization.setEquipment(draft.equipment());
    }

    private void addOwner(Organization organization, String userId) {
        OrganizationMember member = new OrganizationMember();
        member.setOrganizationId(organization.getId());
        member.setUserId(userId);
        member.setName(accounts.get(userId).name());
        member.setPosition("Руководитель");
        member.setAccessRole("OWNER");
        database.insert(member);
    }

    private OrganizationMember insertMember(String organizationId, MemberDraft draft) {
        OrganizationMember member = new OrganizationMember();
        member.setOrganizationId(organizationId);
        member.setName(draft.name().trim());
        member.setPosition(draft.position().trim());
        member.setAccessRole("MEMBER");
        return database.insert(member);
    }

    private OrganizationView view(Organization organization) {
        List<OrganizationView.MemberView> members =
                database
                        .find(OrganizationMember.class, "organizationId", organization.getId())
                        .stream()
                        .map(this::memberView)
                        .toList();
        return new OrganizationView(
                organization.getId(),
                organization.getOwnerId(),
                organization.getName(),
                organization.getType(),
                organization.getInstitution(),
                organization.getCity(),
                organization.getDirection(),
                organization.getDescription(),
                organization.getSkills(),
                organization.getEquipment(),
                organization.getVersion(),
                members);
    }

    private OrganizationView.MemberView memberView(OrganizationMember member) {
        return new OrganizationView.MemberView(
                member.getId(),
                member.getUserId(),
                member.getName(),
                member.getPosition(),
                member.getAccessRole());
    }
}
