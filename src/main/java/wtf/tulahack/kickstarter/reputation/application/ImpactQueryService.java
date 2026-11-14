package wtf.tulahack.kickstarter.reputation.application;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import wtf.tulahack.kickstarter.funding.api.FundingSummary;
import wtf.tulahack.kickstarter.funding.api.FundingTotals;
import wtf.tulahack.kickstarter.reputation.domain.RankPolicy;
import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImpactQueryService {
    private final FundingTotals funding;
    private final RankPolicy ranks = new RankPolicy();

    public Impact get(Actor actor) {
        FundingSummary summary = funding.forUser(actor.id());
        List<String> achievements = new ArrayList<>();
        if (summary.contributions() > 0) {
            achievements.add("Первый вклад");
        }
        if (summary.contributions() >= 3) {
            achievements.add("Постоянный спонсор");
        }
        if (summary.amountKopecks() >= 5000000) {
            achievements.add("Большая поддержка");
        }
        return new Impact(
                summary,
                ranks.current(summary.amountKopecks()),
                ranks.next(summary.amountKopecks()),
                List.copyOf(achievements));
    }

    public record Impact(
            FundingSummary funding,
            RankPolicy.Rank rank,
            RankPolicy.Rank nextRank,
            List<String> achievements) {}
}
