package wtf.tulahack.kickstarter.research.internal.domain;

import com.j256.ormlite.field.DatabaseField;
import com.j256.ormlite.table.DatabaseTable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.persistence.StoredEntity;

@Getter
@Setter
@NoArgsConstructor
@DatabaseTable(tableName = "projects")
public class ResearchProject extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String organizationId;

    @DatabaseField(canBeNull = false, width = 200)
    private String title;

    @DatabaseField(canBeNull = false, width = 100)
    private String category;

    @DatabaseField(canBeNull = false, width = 5000)
    private String summary;

    @DatabaseField(canBeNull = false, width = 5000)
    private String hypothesis;

    @DatabaseField(canBeNull = false, width = 5000)
    private String method;

    @DatabaseField(canBeNull = false, width = 5000)
    private String result;

    @DatabaseField(canBeNull = false, width = 5000)
    private String risks;

    @DatabaseField(canBeNull = false, width = 10)
    private String visibility;

    @DatabaseField(canBeNull = false, width = 15)
    private String status;

    public void requireDraft() {
        if (!"DRAFT".equals(status)) {
            throw ApplicationException.conflict("Опубликованный проект нельзя менять");
        }
    }

    public void publish() {
        requireDraft();
        status = "PUBLISHED";
    }
}
