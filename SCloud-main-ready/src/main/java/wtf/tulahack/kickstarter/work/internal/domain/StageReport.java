package wtf.tulahack.kickstarter.work.internal.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "stage_reports")
public class StageReport extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String orderId;

    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String stageId;

    @DatabaseField(canBeNull = false, width = 200)
    private String title;

    @DatabaseField(canBeNull = false, width = 10000)
    private String work;

    @DatabaseField(canBeNull = false, width = 10000)
    private String conclusion;

    @DatabaseField(canBeNull = false, width = 5000)
    private String limitations;

    @DatabaseField(width = 5000)
    private String feedback;

    @DatabaseField(canBeNull = false, width = 15)
    private String decision;

    @DatabaseField(canBeNull = false, width = 2000)
    private String attachmentIdsJson;
}
