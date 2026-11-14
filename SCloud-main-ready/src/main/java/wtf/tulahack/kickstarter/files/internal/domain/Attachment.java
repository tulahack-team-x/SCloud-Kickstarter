package wtf.tulahack.kickstarter.files.internal.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "attachments")
public class Attachment extends StoredEntity {
    @DatabaseField(canBeNull = false, width = 36)
    private String uploaderId;

    @DatabaseField(canBeNull = false, width = 10)
    private String ownerType;

    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String ownerId;

    @DatabaseField(canBeNull = false, width = 200)
    private String name;

    @DatabaseField(canBeNull = false, width = 100)
    private String contentType;

    @DatabaseField(canBeNull = false)
    private long size;
}
