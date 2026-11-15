package wtf.tulahack.kickstarter.recommendation.internal.application;

import java.util.List;

public record RecommendationCandidate(
        String organizationId,
        String name,
        String direction,
        String description,
        List<String> skills,
        List<String> equipment,
        List<String> similarResearch) {}
