package wtf.tulahack.kickstarter.funding.internal.web.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import wtf.tulahack.kickstarter.funding.internal.application.ContributionService;
import wtf.tulahack.kickstarter.funding.internal.web.FundingDto;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class ContributionController {
    private final ReadCache readCache;
    private final ContributionService contributions;
    private final CurrentActorProvider actors;

    @PostMapping("/api/projects/{id}/contributions")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<FundingDto> create(
            @PathVariable String id,
            @RequestHeader("Idempotency-Key") String key,
            @Valid @RequestBody Amount request) {
        Actor actor = actors.require();
        return () -> FundingDto.from(contributions.create(actor, id, request.amountKopecks(), key));
    }

    @PostMapping("/api/demo/contributions/{id}/confirmation")
    public Callable<FundingDto> confirm(@PathVariable String id) {
        Actor actor = actors.require();
        return () -> FundingDto.from(contributions.confirmDemo(actor, id));
    }

    @GetMapping("/api/me/contributions")
    public PageSlice<FundingDto> own(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "ContributionController.own",
                () ->
                        PageSlice.from(
                                contributions.own(actor).stream().map(FundingDto::from).toList(),
                                offset,
                                limit),
                actor.id(),
                offset,
                limit);
    }

    public record Amount(@Min(10000) @Max(1000000000) long amountKopecks) {}
}
