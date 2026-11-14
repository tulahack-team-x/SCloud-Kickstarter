package wtf.tulahack.kickstarter.funding.internal.web;

import wtf.tulahack.kickstarter.funding.internal.domain.Contribution;

public record FundingDto(
        String id,
        String projectId,
        String userId,
        long amountKopecks,
        String status,
        String createdAt,
        long version) {
    public static FundingDto from(Contribution contribution) {
        return new FundingDto(
                contribution.getId(),
                contribution.getProjectId(),
                contribution.getUserId(),
                contribution.getAmountKopecks(),
                contribution.getStatus(),
                contribution.getCreatedAt(),
                contribution.getVersion());
    }
}
