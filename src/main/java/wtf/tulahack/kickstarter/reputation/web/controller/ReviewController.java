package wtf.tulahack.kickstarter.reputation.web.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import wtf.tulahack.kickstarter.reputation.application.ImpactQueryService;
import wtf.tulahack.kickstarter.reputation.application.ReviewService;
import wtf.tulahack.kickstarter.reputation.web.ReputationDto;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReadCache readCache;
    private final ReviewService reviews;
    private final ImpactQueryService impact;
    private final CurrentActorProvider actors;

    @GetMapping("/api/me/impact")
    public ImpactQueryService.Impact impact() {
        Actor actor = actors.require();
        return readCache.get("ReviewController.impact", () -> impact.get(actor), actor.id());
    }

    @PostMapping("/api/orders/{id}/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<ReputationDto> create(
            @PathVariable String id, @Valid @RequestBody ReviewDraft request) {
        Actor actor = actors.require();
        return () ->
                ReputationDto.from(reviews.create(actor, id, request.rating(), request.text()));
    }

    @GetMapping("/api/organizations/{id}/reviews")
    public PageSlice<ReputationDto> organization(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        return readCache.get(
                "ReviewController.organization",
                () ->
                        PageSlice.from(
                                reviews.organizationReviews(id).stream()
                                        .map(ReputationDto::from)
                                        .toList(),
                                offset,
                                limit),
                id,
                offset,
                limit);
    }

    @GetMapping("/api/me/reviews")
    public PageSlice<ReputationDto> own(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "ReviewController.own",
                () ->
                        PageSlice.from(
                                reviews.own(actor).stream().map(ReputationDto::from).toList(),
                                offset,
                                limit),
                actor.id(),
                offset,
                limit);
    }

    public record ReviewDraft(
            @Min(1) @Max(5) int rating, @NotBlank @Size(min = 10, max = 5000) String text) {}
}
