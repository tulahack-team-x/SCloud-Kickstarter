package wtf.tulahack.kickstarter.work.internal.web.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;
import wtf.tulahack.kickstarter.work.internal.application.OrderService;
import wtf.tulahack.kickstarter.work.internal.application.StageReportService;
import wtf.tulahack.kickstarter.work.internal.domain.*;
import wtf.tulahack.kickstarter.work.internal.web.WorkResponses;

import java.net.URI;
import java.util.concurrent.Callable;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final ReadCache readCache;
    private final OrderService orders;
    private final StageReportService reports;
    private final CurrentActorProvider actors;
    private final ObjectMapper json;

    @PostMapping("/api/requests")
    public Callable<ResponseEntity<WorkResponses.Request>> createRequest(
            @Valid @RequestBody OrderService.RequestDraft request) {
        Actor actor = actors.require();
        return () -> {
            ResearchRequest created = orders.createRequest(actor, request);
            return ResponseEntity.created(URI.create("/api/requests/" + created.getId()))
                    .body(WorkResponses.from(created));
        };
    }

    @GetMapping("/api/requests")
    public PageSlice<WorkResponses.Request> requests(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.requests",
                () ->
                        PageSlice.from(
                                orders.requests(actor).stream().map(WorkResponses::from).toList(),
                                offset,
                                limit),
                actor.id(),
                offset,
                limit);
    }

    @GetMapping("/api/requests/{id}")
    public WorkResponses.Request request(@PathVariable String id) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.request",
                () -> WorkResponses.from(orders.request(actor, id)),
                actor.id(),
                id);
    }

    @PostMapping("/api/requests/{id}/proposals")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<OrderService.ProposalView> propose(
            @PathVariable String id, @Valid @RequestBody OrderService.ProposalDraft request) {
        Actor actor = actors.require();
        return () -> orders.propose(actor, id, request);
    }

    @GetMapping("/api/requests/{id}/proposals")
    public PageSlice<OrderService.ProposalView> proposals(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.proposals",
                () -> PageSlice.from(orders.proposals(actor, id), offset, limit),
                actor.id(),
                id,
                offset,
                limit);
    }

    @PostMapping("/api/requests/{id}/order")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<WorkResponses.Order> accept(
            @PathVariable String id, @Valid @RequestBody Acceptance request) {
        Actor actor = actors.require();
        return () ->
                WorkResponses.from(
                        orders.acceptProposal(
                                actor, id, request.proposalId(), request.expectedVersion()));
    }

    @GetMapping("/api/orders")
    public PageSlice<WorkResponses.Order> orders(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.orders",
                () ->
                        PageSlice.from(
                                orders.orders(actor).stream().map(WorkResponses::from).toList(),
                                offset,
                                limit),
                actor.id(),
                offset,
                limit);
    }

    @GetMapping("/api/orders/{id}")
    public WorkResponses.Order order(@PathVariable String id) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.order",
                () -> WorkResponses.from(orders.order(actor, id)),
                actor.id(),
                id);
    }

    @GetMapping("/api/orders/{id}/activity")
    public PageSlice<WorkResponses.Activity> activity(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.activity",
                () ->
                        PageSlice.from(
                                orders.history(actor, id).stream()
                                        .map(WorkResponses::from)
                                        .toList(),
                                offset,
                                limit),
                actor.id(),
                id,
                offset,
                limit);
    }

    @PostMapping("/api/orders/{orderId}/stages/{stageId}/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public Callable<WorkResponses.Report> submit(
            @PathVariable String orderId,
            @PathVariable String stageId,
            @Valid @RequestBody StageReportService.ReportDraft request) {
        Actor actor = actors.require();
        return () -> WorkResponses.from(reports.submit(actor, orderId, stageId, request), json);
    }

    @GetMapping("/api/orders/{orderId}/stages/{stageId}/reports")
    public PageSlice<WorkResponses.Report> reports(
            @PathVariable String orderId,
            @PathVariable String stageId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        Actor actor = actors.require();
        return readCache.get(
                "OrderController.reports",
                () ->
                        PageSlice.from(
                                reports.history(actor, orderId, stageId).stream()
                                        .map(report -> WorkResponses.from(report, json))
                                        .toList(),
                                offset,
                                limit),
                actor.id(),
                orderId,
                stageId,
                offset,
                limit);
    }

    @PostMapping("/api/orders/{orderId}/stages/{stageId}/decision")
    public Callable<WorkResponses.Stage> decide(
            @PathVariable String orderId,
            @PathVariable String stageId,
            @Valid @RequestBody StageReportService.Decision request) {
        Actor actor = actors.require();
        return () -> WorkResponses.from(reports.decide(actor, orderId, stageId, request));
    }

    public record Acceptance(@NotBlank String proposalId, @PositiveOrZero long expectedVersion) {}
}
