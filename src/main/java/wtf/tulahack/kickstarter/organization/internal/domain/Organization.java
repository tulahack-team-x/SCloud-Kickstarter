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
@DatabaseTable(tableName = "organizations")
public class Organization extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String ownerId;

    @DatabaseField(canBeNull = false, width = 150)
    private String name;

    @DatabaseField(canBeNull = false, width = 20)
    private String type;

    @DatabaseField(width = 200)
    private String institution;

    @DatabaseField(width = 100)
    private String city;

    @DatabaseField(width = 100)
    private String direction;

    @DatabaseField(width = 10000)
    private String description;

    @DatabaseField(width = 2000)
    private String skills;

    @DatabaseField(width = 2000)
    private String equipment;
}
