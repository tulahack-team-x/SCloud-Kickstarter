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
@DatabaseTable(tableName = "research_requests")
public class ResearchRequest extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String customerId;

    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String organizationId;

    @DatabaseField(canBeNull = false, width = 200)
    private String title;

    @DatabaseField(canBeNull = false, width = 10000)
    private String description;

    @DatabaseField(canBeNull = false)
    private long budgetKopecks;

    @DatabaseField(canBeNull = false)
    private int weeks;

    @DatabaseField(canBeNull = false, width = 15)
    private String status;
}
