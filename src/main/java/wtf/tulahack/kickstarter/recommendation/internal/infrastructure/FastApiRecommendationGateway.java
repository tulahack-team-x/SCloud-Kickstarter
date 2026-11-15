package wtf.tulahack.kickstarter.recommendation.internal.infrastructure;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationCandidate;
import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationGateway;
import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationTask;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

@RequiredArgsConstructor
public class FastApiRecommendationGateway implements RecommendationGateway {
    private final HttpClient client;
    private final ObjectMapper json;
    private final URI endpoint;
    private final String serviceKey;

    @Override
    public CompletableFuture<String> select(
            RecommendationTask task, List<RecommendationCandidate> candidates) {
        if (serviceKey.isBlank()) {
            throw new ApplicationException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "RECOMMENDATION_NOT_CONFIGURED",
                    "Сервис подбора не настроен");
        }
        HttpRequest request =
                HttpRequest.newBuilder(endpoint)
                        .version(HttpClient.Version.HTTP_1_1)
                        .timeout(Duration.ofSeconds(70))
                        .header("Content-Type", "application/json")
                        .header("X-Service-Key", serviceKey)
                        .POST(
                                HttpRequest.BodyPublishers.ofString(
                                        json.writeValueAsString(
                                                new SelectionRequest(task, candidates))))
                        .build();
        return client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .handle(
                        (response, error) -> {
                            if (error != null) {
                                Throwable cause =
                                        error instanceof CompletionException
                                                ? error.getCause()
                                                : error;
                                HttpStatus status =
                                        cause instanceof java.net.http.HttpTimeoutException
                                                ? HttpStatus.GATEWAY_TIMEOUT
                                                : HttpStatus.SERVICE_UNAVAILABLE;
                                throw new ApplicationException(
                                        status,
                                        "RECOMMENDATION_UNAVAILABLE",
                                        "Сервис подбора недоступен. Повторите позже");
                            }
                            if (response.statusCode() != 200) {
                                HttpStatus status =
                                        switch (response.statusCode()) {
                                            case 429, 503 -> HttpStatus.SERVICE_UNAVAILABLE;
                                            case 504 -> HttpStatus.GATEWAY_TIMEOUT;
                                            default -> HttpStatus.BAD_GATEWAY;
                                        };
                                throw new ApplicationException(
                                        status,
                                        "RECOMMENDATION_FAILED",
                                        "Не удалось выполнить подбор команды");
                            }
                            try {
                                var result = json.readTree(response.body());
                                if (!result.isObject() || !result.has("organizationId")) {
                                    throw new IllegalArgumentException("Missing organizationId");
                                }
                                var organizationId = result.get("organizationId");
                                if (organizationId.isNull()) {
                                    return null;
                                }
                                if (!organizationId.isString()
                                        || organizationId.stringValue().isBlank()) {
                                    throw new IllegalArgumentException("Invalid organizationId");
                                }
                                return organizationId.stringValue();
                            } catch (RuntimeException exception) {
                                throw new ApplicationException(
                                        HttpStatus.BAD_GATEWAY,
                                        "INVALID_RECOMMENDATION",
                                        "Некорректный ответ сервиса подбора");
                            }
                        });
    }

    private record SelectionRequest(
            RecommendationTask task, List<RecommendationCandidate> candidates) {}
}
