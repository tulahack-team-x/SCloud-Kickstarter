package wtf.tulahack.kickstarter.work.internal.web;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.work.internal.application.OrderService;
import wtf.tulahack.kickstarter.work.internal.domain.*;

import java.util.Arrays;
import java.util.List;

public final class WorkResponses {
    private WorkResponses() {}

    public static Request from(ResearchRequest request) {
        return new Request(
                request.getId(),
                request.getCustomerId(),
                request.getOrganizationId(),
                request.getTitle(),
                request.getDescription(),
                request.getBudgetKopecks(),
                request.getWeeks(),
                request.getStatus(),
                request.getVersion(),
                request.getCreatedAt());
    }

    public static Stage from(OrderStage stage) {
        return new Stage(
                stage.getId(),
                stage.getOrderId(),
                stage.getPosition(),
                stage.getTitle(),
                stage.getResult(),
                stage.getAcceptance(),
                stage.getWeeks(),
                stage.getBudgetKopecks(),
                stage.getStatus(),
                stage.getCurrentReportId(),
                stage.getVersion());
    }

    public static Order from(OrderService.OrderView order) {
        return new Order(
                order.id(),
                order.requestId(),
                order.proposalId(),
                order.customerId(),
                order.organizationId(),
                order.title(),
                order.status(),
                order.version(),
                order.createdAt(),
                order.stages().stream().map(WorkResponses::from).toList());
    }

    public static Activity from(OrderActivity activity) {
        return new Activity(
                activity.getId(),
                activity.getActorId(),
                activity.getText(),
                activity.getCreatedAt());
    }

    public static Report from(StageReport report, ObjectMapper json) {
        return new Report(
                report.getId(),
                report.getOrderId(),
                report.getStageId(),
                report.getTitle(),
                report.getWork(),
                report.getConclusion(),
                report.getLimitations(),
                report.getFeedback(),
                report.getDecision(),
                report.getCreatedAt(),
                Arrays.asList(json.readValue(report.getAttachmentIdsJson(), String[].class)));
    }

    public record Request(
            String id,
            String customerId,
            String organizationId,
            String title,
            String description,
            long budgetKopecks,
            int weeks,
            String status,
            long version,
            String createdAt) {}

    public record Stage(
            String id,
            String orderId,
            int position,
            String title,
            String result,
            String acceptance,
            int weeks,
            long budgetKopecks,
            String status,
            String currentReportId,
            long version) {}

    public record Order(
            String id,
            String requestId,
            String proposalId,
            String customerId,
            String organizationId,
            String title,
            String status,
            long version,
            String createdAt,
            List<Stage> stages) {}

    public record Activity(String id, String actorId, String text, String createdAt) {}

    public record Report(
            String id,
            String orderId,
            String stageId,
            String title,
            String work,
            String conclusion,
            String limitations,
            String feedback,
            String decision,
            String createdAt,
            List<String> attachmentIds) {}
}
