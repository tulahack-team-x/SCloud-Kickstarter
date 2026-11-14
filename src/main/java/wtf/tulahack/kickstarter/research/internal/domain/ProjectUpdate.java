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
@DatabaseTable(tableName = "project_updates")
public class ProjectUpdate extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String projectId;

    @DatabaseField(canBeNull = false, width = 36)
    private String stageId;

    @DatabaseField(canBeNull = false, width = 200)
    private String title;

    @DatabaseField(canBeNull = false, width = 10000)
    private String text;

    @DatabaseField(canBeNull = false)
    private boolean completed;
}
