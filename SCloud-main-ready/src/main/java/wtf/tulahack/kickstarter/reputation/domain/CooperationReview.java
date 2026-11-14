package wtf.tulahack.kickstarter.reputation.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "reviews")
public class CooperationReview extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String orderId;

    @DatabaseField(canBeNull = false, width = 36)
    private String authorId;

    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String subjectId;

    @DatabaseField(canBeNull = false, width = 20)
    private String subjectType;

    @DatabaseField(canBeNull = false, unique = true, width = 80)
    private String reviewKey;

    @DatabaseField(canBeNull = false)
    private int rating;

    @DatabaseField(canBeNull = false, width = 5000)
    private String text;
}
