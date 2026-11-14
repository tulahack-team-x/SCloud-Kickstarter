package wtf.tulahack.kickstarter.organization.internal.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "organization_members")
public class OrganizationMember extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String organizationId;

    @DatabaseField(width = 36)
    private String userId;

    @DatabaseField(canBeNull = false, width = 100)
    private String name;

    @DatabaseField(canBeNull = false, width = 100)
    private String position;

    @DatabaseField(canBeNull = false, width = 10)
    private String accessRole;
}
