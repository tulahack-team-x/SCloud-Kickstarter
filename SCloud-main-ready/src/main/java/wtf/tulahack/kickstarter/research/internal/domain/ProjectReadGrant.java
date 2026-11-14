package wtf.tulahack.kickstarter.research.internal.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "project_read_grants")
public class ProjectReadGrant extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String projectId;

    @DatabaseField(canBeNull = false, width = 36)
    private String userId;

    @DatabaseField(canBeNull = false, unique = true, width = 80)
    private String grantKey;
}
