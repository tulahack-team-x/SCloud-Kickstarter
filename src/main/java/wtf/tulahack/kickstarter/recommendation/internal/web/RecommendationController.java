package wtf.tulahack.kickstarter.recommendation.internal.web;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.async.DeferredResult;

import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationResult;
import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationService;
import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationTask;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.util.concurrent.CompletionException;

@RestController
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendations;
    private final CurrentActorProvider actors;

    @PostMapping("/api/recommendations")
    public DeferredResult<RecommendationResult> recommend(
            @Valid @RequestBody RecommendationTask task) {
        var future = recommendations.recommend(actors.require(), task);
        DeferredResult<RecommendationResult> result = new DeferredResult<>(75000L);
        result.onTimeout(
                () -> {
                    result.setErrorResult(
                            new ApplicationException(
                                    HttpStatus.GATEWAY_TIMEOUT,
                                    "RECOMMENDATION_TIMEOUT",
                                    "Подбор занял слишком много времени"));
                    future.cancel(true);
                });
        future.whenComplete(
                (recommendation, error) -> {
                    if (error == null) {
                        result.setResult(recommendation);
                    } else {
                        result.setErrorResult(
                                error instanceof CompletionException ? error.getCause() : error);
                    }
                });
        return result;
    }
}
