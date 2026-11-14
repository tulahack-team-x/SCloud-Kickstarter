package wtf.tulahack.kickstarter.work.internal.application;

import jakarta.validation.constraints.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.files.api.AttachmentOwner;
import wtf.tulahack.kickstarter.files.api.Attachments;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.work.api.WorkAccess;
import wtf.tulahack.kickstarter.work.internal.domain.*;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StageReportService {
    private final Database database;
    private final WorkAccess access;
    private final Attachments attachments;
    private final ObjectMapper json;

    public StageReport submit(Actor actor, String orderId, String stageId, ReportDraft draft) {
        return database.write(
                () -> {
                    access.requireTeamOwner(actor, orderId);
                    OrderStage stage = stage(orderId, stageId);
                    stage.requireVersion(draft.expectedVersion());
                    if (!List.of("WORKING", "REVISION").contains(stage.getStatus())) {
                        throw ApplicationException.conflict("Этап не готов к сдаче отчёта");
                    }
                    List<String> attachmentIds =
                            draft.attachmentIds() == null ? List.of() : draft.attachmentIds();
                    attachments.requireReadyFor(
                            actor, new AttachmentOwner("ORDER", orderId), attachmentIds);
                    StageReport report = new StageReport();
                    report.setOrderId(orderId);
                    report.setStageId(stageId);
                    report.setTitle(draft.title().trim());
                    report.setWork(draft.work().trim());
                    report.setConclusion(draft.conclusion().trim());
                    report.setLimitations(draft.limitations().trim());
                    report.setAttachmentIdsJson(json.writeValueAsString(attachmentIds));
                    report.setDecision("PENDING");
                    database.insert(report);
                    stage.submitReport(report.getId());
                    database.update(stage);
                    activity(orderId, actor.id(), "Сдан отчёт: " + stage.getTitle());
                    return report;
                });
    }

    public OrderStage decide(Actor actor, String orderId, String stageId, Decision decision) {
        return database.write(
                () -> {
                    access.requireCustomer(actor, orderId);
                    OrderStage stage = stage(orderId, stageId);
                    stage.requireVersion(decision.expectedVersion());
                    stage.requireCurrentReport(decision.reportId());
                    if (!decision.accepted()
                            && (decision.comment() == null || decision.comment().isBlank())) {
                        throw ApplicationException.invalid("Опишите, что нужно доработать");
                    }
                    StageReport report = database.get(StageReport.class, decision.reportId());
                    if (!report.getStageId().equals(stageId)
                            || !report.getOrderId().equals(orderId)) {
                        throw ApplicationException.notFound();
                    }
                    report.setDecision(decision.accepted() ? "ACCEPTED" : "REVISION");
                    report.setFeedback(decision.comment());
                    database.update(report);
                    stage.decide(decision.reportId(), decision.accepted());
                    database.update(stage);
                    if (decision.accepted()) {
                        startNext(orderId);
                    }
                    activity(
                            orderId,
                            actor.id(),
                            (decision.accepted() ? "Принят этап: " : "Запрошена доработка: ")
                                    + stage.getTitle());
                    return stage;
                });
    }

    public List<StageReport> history(Actor actor, String orderId, String stageId) {
        access.requireParticipant(actor, orderId);
        stage(orderId, stageId);
        return database.find(StageReport.class, "stageId", stageId).stream()
                .sorted(Comparator.comparing(StageReport::getCreatedAt))
                .toList();
    }

    private OrderStage stage(String orderId, String stageId) {
        OrderStage stage = database.get(OrderStage.class, stageId);
        if (!stage.getOrderId().equals(orderId)) {
            throw ApplicationException.notFound();
        }
        return stage;
    }

    private void startNext(String orderId) {
        List<OrderStage> stages = database.find(OrderStage.class, "orderId", orderId);
        OrderStage next =
                stages.stream()
                        .filter(stage -> "PLANNED".equals(stage.getStatus()))
                        .min(Comparator.comparingInt(OrderStage::getPosition))
                        .orElse(null);
        if (next != null) {
            next.start();
            database.update(next);
            return;
        }
        ResearchOrder order = database.get(ResearchOrder.class, orderId);
        order.setStatus("COMPLETED");
        database.update(order);
    }

    private void activity(String orderId, String actorId, String text) {
        OrderActivity activity = new OrderActivity();
        activity.setOrderId(orderId);
        activity.setActorId(actorId);
        activity.setText(text);
        database.insert(activity);
    }

    public record ReportDraft(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(min = 10, max = 10000) String work,
            @NotBlank @Size(min = 10, max = 10000) String conclusion,
            @NotBlank @Size(max = 5000) String limitations,
            @Size(max = 10) List<@NotBlank String> attachmentIds,
            @PositiveOrZero long expectedVersion) {}

    public record Decision(
            @NotBlank String reportId,
            boolean accepted,
            @Size(max = 5000) String comment,
            @PositiveOrZero long expectedVersion) {}
}
