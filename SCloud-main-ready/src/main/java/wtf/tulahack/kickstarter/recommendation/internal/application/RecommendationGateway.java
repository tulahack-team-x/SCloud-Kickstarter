package wtf.tulahack.kickstarter.recommendation.internal.application;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface RecommendationGateway {
    CompletableFuture<String> select(
            RecommendationTask task, List<RecommendationCandidate> candidates);
}
