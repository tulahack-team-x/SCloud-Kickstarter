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
@DatabaseTable(tableName = "order_activity")
public class OrderActivity extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String orderId;

    @DatabaseField(canBeNull = false, width = 36)
    private String actorId;

    @DatabaseField(canBeNull = false, width = 1000)
    private String text;
}
