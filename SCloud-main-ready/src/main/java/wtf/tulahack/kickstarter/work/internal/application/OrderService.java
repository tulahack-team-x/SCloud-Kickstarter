package wtf.tulahack.kickstarter.work.internal.application;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import tools.jackson.databind.ObjectMapper;

import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog.StageDraft;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.persistence.Database;
import wtf.tulahack.kickstarter.work.api.WorkAccess;
import wtf.tulahack.kickstarter.work.internal.domain.*;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final Database database;
    private final Organizations organizations;
    private final WorkAccess access;
    private final ObjectMapper json;

    public ResearchRequest createRequest(Actor actor, RequestDraft draft) {
        actor.requireRole(AccountRole.CUSTOMER);
        return database.write(
                () -> {
                    if (!"SCIENTIFIC".equals(organizations.get(draft.organizationId()).type())) {
                        throw ApplicationException.invalid("Заказ нужно направить научной команде");
                    }
                    ResearchRequest request = new ResearchRequest();
                    request.setCustomerId(actor.id());
                    request.setOrganizationId(draft.organizationId());
                    request.setTitle(draft.title().trim());
                    request.setDescription(draft.description().trim());
                    request.setBudgetKopecks(draft.budgetKopecks());
                    request.setWeeks(draft.weeks());
                    request.setStatus("SENT");
                    return database.insert(request);
                });
    }

    public List<ResearchRequest> requests(Actor actor) {
        return database.all(ResearchRequest.class).stream()
                .filter(request -> canRead(actor, request))
                .toList();
    }

    public ResearchRequest request(Actor actor, String id) {
        ResearchRequest request = database.get(ResearchRequest.class, id);
        if (!canRead(actor, request)) {
            throw ApplicationException.notFound();
        }
        return request;
    }

    public ProposalView propose(Actor actor, String requestId, ProposalDraft draft) {
        return database.write(
                () -> {
                    ResearchRequest request = request(actor, requestId);
                    organizations.requireOwner(actor, request.getOrganizationId());
                    request.requireVersion(draft.expectedVersion());
                    if ("ACCEPTED".equals(request.getStatus())) {
                        throw ApplicationException.conflict("По запросу уже создан заказ");
                    }
                    ResearchProposal proposal = new ResearchProposal();
                    proposal.setRequestId(requestId);
                    proposal.setText(draft.text().trim());
                    proposal.setStagesJson(json.writeValueAsString(draft.stages()));
                    database.insert(proposal);
                    request.setStatus("PROPOSED");
                    database.update(request);
                    return proposalView(proposal);
                });
    }

    public List<ProposalView> proposals(Actor actor, String requestId) {
        request(actor, requestId);
        return database.find(ResearchProposal.class, "requestId", requestId).stream()
                .map(this::proposalView)
                .toList();
    }

    public OrderView acceptProposal(
            Actor actor, String requestId, String proposalId, long expectedVersion) {
        return database.write(
                () -> {
                    ResearchRequest request = request(actor, requestId);
                    if (!request.getCustomerId().equals(actor.id())) {
                        throw ApplicationException.forbidden();
                    }
                    ResearchProposal proposal = database.get(ResearchProposal.class, proposalId);
                    if (!proposal.getRequestId().equals(requestId)) {
                        throw ApplicationException.notFound();
                    }
                    ResearchOrder existing =
                            database.find(ResearchOrder.class, "requestId", requestId).stream()
                                    .findFirst()
                                    .orElse(null);
                    if (existing != null) {
                        if (!existing.getProposalId().equals(proposalId)) {
                            throw ApplicationException.conflict("Принято другое предложение");
                        }
                        return orderView(existing);
                    }
                    request.requireVersion(expectedVersion);
                    if (!"PROPOSED".equals(request.getStatus())) {
                        throw ApplicationException.conflict(
                                "Запрос не ожидает принятия предложения");
                    }
                    List<ResearchProposal> proposals =
                            database.find(ResearchProposal.class, "requestId", requestId);
                    ResearchProposal latest =
                            proposals.stream()
                                    .max(Comparator.comparing(ResearchProposal::getCreatedAt))
                                    .orElseThrow();
                    if (!latest.getId().equals(proposalId)) {
                        throw ApplicationException.conflict("Команда прислала новое предложение");
                    }
                    ResearchOrder order = new ResearchOrder();
                    order.setRequestId(requestId);
                    order.setProposalId(proposalId);
                    order.setCustomerId(actor.id());
                    order.setOrganizationId(request.getOrganizationId());
                    order.setTitle(request.getTitle());
                    order.setStatus("ACTIVE");
                    database.insert(order);
                    List<StageDraft> stages = readStages(proposal);
                    for (int position = 0; position < stages.size(); position++) {
                        StageDraft draft = stages.get(position);
                        OrderStage stage = new OrderStage();
                        stage.setOrderId(order.getId());
                        stage.setPosition(position);
                        stage.setTitle(draft.title().trim());
                        stage.setResult(draft.result().trim());
                        stage.setAcceptance(draft.acceptance().trim());
                        stage.setWeeks(draft.weeks());
                        stage.setBudgetKopecks(draft.budgetKopecks());
                        stage.setStatus(position == 0 ? "WORKING" : "PLANNED");
                        database.insert(stage);
                    }
                    request.setStatus("ACCEPTED");
                    database.update(request);
                    addActivity(order.getId(), actor.id(), "Предложение принято, заказ создан");
                    return orderView(order);
                });
    }

    public List<OrderView> orders(Actor actor) {
        return database.all(ResearchOrder.class).stream()
                .filter(
                        order ->
                                order.getCustomerId().equals(actor.id())
                                        || organizations.isMember(actor, order.getOrganizationId()))
                .map(this::orderView)
                .toList();
    }

    public OrderView order(Actor actor, String orderId) {
        access.requireParticipant(actor, orderId);
        return orderView(database.get(ResearchOrder.class, orderId));
    }

    public List<OrderActivity> history(Actor actor, String orderId) {
        access.requireParticipant(actor, orderId);
        return database.find(OrderActivity.class, "orderId", orderId);
    }

    private void addActivity(String orderId, String actorId, String text) {
        OrderActivity activity = new OrderActivity();
        activity.setOrderId(orderId);
        activity.setActorId(actorId);
        activity.setText(text);
        database.insert(activity);
    }

    private boolean canRead(Actor actor, ResearchRequest request) {
        return actor.id().equals(request.getCustomerId())
                || organizations.isMember(actor, request.getOrganizationId());
    }

    private OrderView orderView(ResearchOrder order) {
        List<OrderStage> stages =
                database.find(OrderStage.class, "orderId", order.getId()).stream()
                        .sorted(Comparator.comparingInt(OrderStage::getPosition))
                        .toList();
        return new OrderView(
                order.getId(),
                order.getRequestId(),
                order.getProposalId(),
                order.getCustomerId(),
                order.getOrganizationId(),
                order.getTitle(),
                order.getStatus(),
                order.getVersion(),
                order.getCreatedAt(),
                stages);
    }

    private ProposalView proposalView(ResearchProposal proposal) {
        return new ProposalView(
                proposal.getId(),
                proposal.getRequestId(),
                proposal.getText(),
                proposal.getCreatedAt(),
                readStages(proposal));
    }

    private List<StageDraft> readStages(ResearchProposal proposal) {
        return Arrays.asList(json.readValue(proposal.getStagesJson(), StageDraft[].class));
    }

    public record RequestDraft(
            @NotBlank String organizationId,
            @NotBlank @Size(min = 5, max = 200) String title,
            @NotBlank @Size(min = 20, max = 10000) String description,
            @Min(10000) @Max(1000000000) long budgetKopecks,
            @Min(1) @Max(520) int weeks) {}

    public record ProposalDraft(
            @NotBlank @Size(min = 10, max = 10000) String text,
            @NotEmpty @Size(max = 20) List<@Valid StageDraft> stages,
            @PositiveOrZero long expectedVersion) {}

    public record ProposalView(
            String id, String requestId, String text, String createdAt, List<StageDraft> stages) {}

    public record OrderView(
            String id,
            String requestId,
            String proposalId,
            String customerId,
            String organizationId,
            String title,
            String status,
            long version,
            String createdAt,
            List<OrderStage> stages) {}
}
