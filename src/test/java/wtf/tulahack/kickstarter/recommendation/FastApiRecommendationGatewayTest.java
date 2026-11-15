package wtf.tulahack.kickstarter.recommendation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import tools.jackson.databind.json.JsonMapper;

import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationTask;
import wtf.tulahack.kickstarter.recommendation.internal.infrastructure.FastApiRecommendationGateway;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

@ExtendWith(MockitoExtension.class)
class FastApiRecommendationGatewayTest {
    @Mock private HttpClient client;
    @Mock private HttpResponse<String> response;
    private FastApiRecommendationGateway gateway;
    private final RecommendationTask task =
            new RecommendationTask("Проверить сорбент для воды", List.of(), List.of());

    @BeforeEach
    void setUp() {
        gateway =
                new FastApiRecommendationGateway(
                        client,
                        JsonMapper.builder().build(),
                        URI.create("http://127.0.0.1:8000/recommend"),
                        "test-service-key");
    }

    @Test
    void usesInternalKeyAndReturnsId() {
        provider(200, "{\"organizationId\":\"lab\",\"organizationName\":\"Имя модели\"}");
        assertEquals("lab", gateway.select(task, List.of()).join());
        ArgumentCaptor<HttpRequest> request = ArgumentCaptor.forClass(HttpRequest.class);
        verify(client)
                .sendAsync(
                        request.capture(),
                        org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any());
        assertEquals(
                "test-service-key",
                request.getValue().headers().firstValue("X-Service-Key").orElseThrow());
        assertEquals("POST", request.getValue().method());
        assertEquals(HttpClient.Version.HTTP_1_1, request.getValue().version().orElseThrow());
        assertEquals(70, request.getValue().timeout().orElseThrow().getSeconds());
    }

    @Test
    void acceptsExplicitNoMatch() {
        provider(200, "{\"organizationId\":null}");
        assertNull(gateway.select(task, List.of()).join());
    }

    @Test
    void rejectsMissingIdInsteadOfReturningNoMatch() {
        provider(200, "{}");
        assertFailure(HttpStatus.BAD_GATEWAY);
    }

    @Test
    void rejectsInvalidJson() {
        provider(200, "not-json");
        assertFailure(HttpStatus.BAD_GATEWAY);
    }

    @Test
    void reportsUnavailableProvider() {
        provider(503, "{}");
        assertFailure(HttpStatus.SERVICE_UNAVAILABLE);
    }

    @Test
    void reportsTimeout() {
        when(client.sendAsync(
                        any(HttpRequest.class),
                        org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(CompletableFuture.failedFuture(new HttpTimeoutException("timeout")));
        assertFailure(HttpStatus.GATEWAY_TIMEOUT);
    }

    private void provider(int status, String body) {
        when(response.statusCode()).thenReturn(status);
        if (status == 200) {
            when(response.body()).thenReturn(body);
        }
        when(client.sendAsync(
                        any(HttpRequest.class),
                        org.mockito.ArgumentMatchers.<HttpResponse.BodyHandler<String>>any()))
                .thenReturn(CompletableFuture.completedFuture(response));
    }

    private void assertFailure(HttpStatus status) {
        CompletionException exception =
                assertThrows(
                        CompletionException.class, () -> gateway.select(task, List.of()).join());
        ApplicationException cause =
                assertInstanceOf(ApplicationException.class, exception.getCause());
        assertEquals(status, cause.getStatus());
    }
}
