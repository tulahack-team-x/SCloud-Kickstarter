package wtf.tulahack.kickstarter.work.api;

public record OrderContext(
        String id,
        String customerId,
        String organizationId,
        String status,
        boolean hasAcceptedStage,
        String customerOrganizationId) {}
