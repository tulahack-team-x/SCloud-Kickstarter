package wtf.tulahack.kickstarter.recommendation.internal.application;

import com.fasterxml.jackson.annotation.JsonInclude;

import wtf.tulahack.kickstarter.organization.api.OrganizationView;

@JsonInclude(JsonInclude.Include.ALWAYS)
public record RecommendationResult(OrganizationView organization) {}
