package wtf.tulahack.kickstarter.recommendation.internal.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.recommendation.internal.application.RecommendationGateway;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class RecommendationConfiguration {
    @Bean
    public RecommendationGateway recommendationGateway(
            ObjectMapper json,
            @Value("${app.recommendations.url:http://127.0.0.1:8000}") String url,
            @Value("${app.recommendations.service-key:}") String serviceKey) {
        URI endpoint = URI.create(url.replaceAll("/+$", "") + "/recommend");
        if (!("http".equals(endpoint.getScheme()) || "https".equals(endpoint.getScheme()))
                || endpoint.getHost() == null) {
            throw new IllegalArgumentException("Recommendation URL must use HTTP or HTTPS");
        }
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        return new FastApiRecommendationGateway(client, json, endpoint, serviceKey);
    }
}
