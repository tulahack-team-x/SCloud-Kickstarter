package wtf.tulahack.kickstarter.funding.api;

public interface FundingTotals {
    FundingSummary forProject(String projectId);

    FundingSummary forUser(String userId);
}
