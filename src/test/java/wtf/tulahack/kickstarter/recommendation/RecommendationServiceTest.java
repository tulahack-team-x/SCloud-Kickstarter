package wtf.tulahack.kickstarter.recommendation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import tools.jackson.databind.json.JsonMapper;

import wtf.tulahack.kickstarter.organization.api.OrganizationView;
import wtf.tulahack.kickstarter.organization.api.Organizations;
import wtf.tulahack.kickstarter.recommendation.internal.application.*;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog;
import wtf.tulahack.kickstarter.shared.error.ApplicationException;
import wtf.tulahack.kickstarter.shared.model.AccountRole;
import wtf.tulahack.kickstarter.shared.model.Actor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {
    @Mock private Organizations organizations;
    @Mock private ResearchCatalog research;
    @Mock private RecommendationGateway gateway;
    @Captor private ArgumentCaptor<List<RecommendationCandidate>> candidates;
    private RecommendationService service;
    private final Actor customer = new Actor("customer", AccountRole.CUSTOMER);
    private final RecommendationTask task =
            new RecommendationTask("Сравнить сорбенты для очистки воды", null, null);

    @BeforeEach
    void setUp() {
        service =
                new RecommendationService(
                        organizations, research, gateway, JsonMapper.builder().build());
    }

    @Test
    void returnsNoMatchWithoutCallingProviderWhenCatalogIsEmpty() {
        when(research.list(customer, false, null, null)).thenReturn(List.of());
        when(organizations.list()).thenReturn(List.of());
        assertNull(service.recommend(customer, task).join().organization());
        verifyNoInteractions(gateway);
    }

    @Test
    void sendsOnlyScientificTeamsAndPublicResearch() {
        OrganizationView lab = organization("lab", "Лаборатория", "SCIENTIFIC");
        OrganizationView company = organization("company", "Компания", "COMPANY");
        OrganizationView current = organization("lab", "Актуальное название из БД", "SCIENTIFIC");
        when(organizations.list()).thenReturn(List.of(company, lab));
        when(research.list(customer, false, null, null))
                .thenReturn(List.of(project("PUBLIC"), project("PRIVATE")));
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.completedFuture("lab"));
        when(organizations.get("lab")).thenReturn(current);
        assertSame(current, service.recommend(customer, task).join().organization());
        verify(gateway).select(eq(task), candidates.capture());
        assertEquals(1, candidates.getValue().size());
        assertEquals("lab", candidates.getValue().get(0).organizationId());
        assertEquals(
                List.of("Заявленный проект: PUBLIC"),
                candidates.getValue().get(0).similarResearch());
        assertEquals(List.of("Спектрофотометр", "Весы"), candidates.getValue().get(0).equipment());
    }

    @Test
    void rejectsIdOutsideShortlist() {
        catalog();
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.completedFuture("foreign"));
        CompletionException exception =
                assertThrows(
                        CompletionException.class, () -> service.recommend(customer, task).join());
        ApplicationException cause =
                assertInstanceOf(ApplicationException.class, exception.getCause());
        assertEquals(HttpStatus.BAD_GATEWAY, cause.getStatus());
        verify(organizations, never()).get(anyString());
    }

    @Test
    void preservesNoMatchFromProvider() {
        catalog();
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.completedFuture(null));
        assertNull(service.recommend(customer, task).join().organization());
        verify(organizations, never()).get(anyString());
    }

    @Test
    void doesNotBlockWhileProviderIsRunning() {
        catalog();
        CompletableFuture<String> selection = new CompletableFuture<>();
        when(gateway.select(eq(task), anyList())).thenReturn(selection);
        CompletableFuture<RecommendationResult> result = service.recommend(customer, task);
        assertFalse(result.isDone());
        when(organizations.get("lab")).thenReturn(organization("lab", "Лаборатория", "SCIENTIFIC"));
        selection.complete("lab");
        assertEquals("lab", result.join().organization().id());
    }

    @Test
    void doesNotTurnProviderErrorsIntoNoMatch() {
        catalog();
        ApplicationException failure =
                new ApplicationException(
                        HttpStatus.SERVICE_UNAVAILABLE, "UNAVAILABLE", "Unavailable");
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.failedFuture(failure));
        CompletionException exception =
                assertThrows(
                        CompletionException.class, () -> service.recommend(customer, task).join());
        assertSame(failure, exception.getCause());
    }

    @Test
    void rejectsResearcherBeforeReadingCatalog() {
        ApplicationException exception =
                assertThrows(
                        ApplicationException.class,
                        () ->
                                service.recommend(
                                        new Actor("researcher", AccountRole.RESEARCHER), task));
        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        verifyNoInteractions(organizations, research, gateway);
    }

    @Test
    void prioritizesRelevantTeamBeforeLimitingCandidateCount() {
        ArrayList<OrganizationView> catalog = new ArrayList<>();
        for (int index = 0; index < 25; index++) {
            catalog.add(
                    new OrganizationView(
                            "other-" + index,
                            "owner",
                            "Генетика",
                            "SCIENTIFIC",
                            null,
                            null,
                            "Генетика",
                            "Секвенирование",
                            "Анализ ДНК",
                            "Секвенатор",
                            0,
                            List.of()));
        }
        OrganizationView relevant = organization("zz-relevant-team", "Сорбенты", "SCIENTIFIC");
        catalog.add(relevant);
        when(organizations.list()).thenReturn(catalog);
        when(research.list(customer, false, null, null)).thenReturn(List.of());
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.completedFuture("zz-relevant-team"));
        when(organizations.get("zz-relevant-team")).thenReturn(relevant);
        service.recommend(customer, task).join();
        verify(gateway).select(eq(task), candidates.capture());
        assertEquals(20, candidates.getValue().size());
        assertEquals("zz-relevant-team", candidates.getValue().get(0).organizationId());
    }

    @Test
    void keepsLargeCandidatePayloadWithinMicroserviceLimit() {
        ArrayList<OrganizationView> catalog = new ArrayList<>();
        String tags =
                IntStream.range(0, 10)
                        .mapToObj(index -> "я".repeat(300))
                        .collect(Collectors.joining(";"));
        for (int index = 0; index < 20; index++) {
            catalog.add(
                    new OrganizationView(
                            "lab-" + index,
                            "owner",
                            "Лаборатория",
                            "SCIENTIFIC",
                            null,
                            null,
                            "я".repeat(100),
                            "я".repeat(2000),
                            tags,
                            tags,
                            0,
                            List.of()));
        }
        when(organizations.list()).thenReturn(catalog);
        when(research.list(customer, false, null, null)).thenReturn(List.of());
        when(gateway.select(eq(task), anyList()))
                .thenReturn(CompletableFuture.completedFuture(null));
        service.recommend(customer, task).join();
        verify(gateway).select(eq(task), candidates.capture());
        byte[] payload =
                JsonMapper.builder()
                        .build()
                        .writeValueAsBytes(
                                Map.of("task", task, "candidates", candidates.getValue()));
        assertTrue(payload.length <= 64 * 1024);
        assertTrue(candidates.getValue().size() < 20);
        assertFalse(candidates.getValue().isEmpty());
    }

    private void catalog() {
        when(research.list(customer, false, null, null)).thenReturn(List.of());
        when(organizations.list())
                .thenReturn(List.of(organization("lab", "Лаборатория", "SCIENTIFIC")));
    }

    private OrganizationView organization(String id, String name, String type) {
        return new OrganizationView(
                id,
                "owner",
                name,
                type,
                null,
                null,
                "Экология",
                "Сравниваем сорбенты для очистки воды",
                "Сорбенты; Анализ воды",
                "Спектрофотометр; Весы",
                0,
                List.of());
    }

    private ResearchCatalog.ProjectView project(String visibility) {
        return new ResearchCatalog.ProjectView(
                "project-" + visibility,
                "lab",
                visibility,
                "Экология",
                "Описание",
                "Гипотеза",
                "Метод",
                "Результат",
                "Риски",
                visibility,
                "PUBLISHED",
                0,
                "2026-11-14T00:00:00Z",
                List.of());
    }
}
