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
@DatabaseTable(tableName = "project_stages")
public class ProjectStage extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String projectId;

    @DatabaseField(canBeNull = false)
    private int position;

    @DatabaseField(canBeNull = false, width = 200)
    private String title;

    @DatabaseField(canBeNull = false, width = 5000)
    private String result;

    @DatabaseField(canBeNull = false, width = 5000)
    private String acceptance;

    @DatabaseField(canBeNull = false)
    private int weeks;

    @DatabaseField(canBeNull = false)
    private long budgetKopecks;
}
