package wtf.tulahack.kickstarter.funding.internal.domain;

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
@DatabaseTable(tableName = "contributions")
public class Contribution extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String projectId;

    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String userId;

    @DatabaseField(canBeNull = false)
    private long amountKopecks;

    @DatabaseField(canBeNull = false, width = 15)
    private String status;

    @DatabaseField(canBeNull = false, unique = true, width = 150)
    private String requestKey;

    public boolean confirm() {
        if ("CONFIRMED".equals(status)) {
            return false;
        }
        if (!"PENDING".equals(status)) {
            throw ApplicationException.conflict("Нельзя подтвердить этот взнос");
        }
        status = "CONFIRMED";
        return true;
    }
}
