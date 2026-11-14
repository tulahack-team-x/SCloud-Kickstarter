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
@DatabaseTable(tableName = "research_proposals")
public class ResearchProposal extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String requestId;

    @DatabaseField(canBeNull = false, width = 10000)
    private String text;

    @DatabaseField(canBeNull = false, width = 60000)
    private String stagesJson;
}
