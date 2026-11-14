package wtf.tulahack.kickstarter.recommendation.internal.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record RecommendationTask(
        @NotBlank @Size(min = 10, max = 10000) String description,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> mandatoryRequirements,
        @Size(max = 20) List<@NotBlank @Size(max = 300) String> preferences) {
    public RecommendationTask {
        mandatoryRequirements =
                mandatoryRequirements == null ? List.of() : List.copyOf(mandatoryRequirements);
        preferences = preferences == null ? List.of() : List.copyOf(preferences);
    }
}
