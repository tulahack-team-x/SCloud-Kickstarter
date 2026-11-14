package wtf.tulahack.kickstarter.work.internal.domain;

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
@DatabaseTable(tableName = "order_stages")
public class OrderStage extends StoredEntity {
    @DatabaseField(canBeNull = false, index = true, width = 36)
    private String orderId;

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

    @DatabaseField(canBeNull = false, width = 15)
    private String status;

    @DatabaseField(width = 36)
    private String currentReportId;

    public void submitReport(String reportId) {
        if (!"WORKING".equals(status) && !"REVISION".equals(status)) {
            throw ApplicationException.conflict("Этап не готов к сдаче отчёта");
        }
        currentReportId = reportId;
        status = "REVIEW";
    }

    public void requireCurrentReport(String reportId) {
        if (!"REVIEW".equals(status) || !reportId.equals(currentReportId)) {
            throw ApplicationException.conflict("Этот отчёт уже обработан или заменён");
        }
    }

    public void decide(String reportId, boolean accepted) {
        requireCurrentReport(reportId);
        status = accepted ? "ACCEPTED" : "REVISION";
    }

    public void start() {
        if (!"PLANNED".equals(status)) {
            throw ApplicationException.conflict("Этап уже начат");
        }
        status = "WORKING";
    }
}
