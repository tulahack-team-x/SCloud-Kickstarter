package wtf.tulahack.kickstarter.composition.web.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import wtf.tulahack.kickstarter.funding.api.FundingSummary;
import wtf.tulahack.kickstarter.funding.api.FundingTotals;
import wtf.tulahack.kickstarter.research.api.ResearchCatalog;
import wtf.tulahack.kickstarter.shared.cache.ReadCache;
import wtf.tulahack.kickstarter.shared.model.Actor;
import wtf.tulahack.kickstarter.shared.model.PageSlice;
import wtf.tulahack.kickstarter.shared.security.CurrentActorProvider;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectPageController {
    private final ReadCache readCache;
    private final ResearchCatalog projects;
    private final FundingTotals funding;
    private final CurrentActorProvider actors;

    @GetMapping
    public PageSlice<ProjectPage> list(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        Actor actor = actors.optional();
        return readCache.get(
                "ProjectPageController.list",
                () ->
                        PageSlice.from(
                                projects.list(actor, false, query, category).stream()
                                        .map(this::page)
                                        .toList(),
                                offset,
                                limit),
                actor == null ? null : actor.id(),
                offset,
                limit,
                query,
                category);
    }

    @GetMapping("/{id}")
    public ProjectPage get(@PathVariable String id) {
        Actor actor = actors.optional();
        return readCache.get(
                "ProjectPageController.get",
                () -> page(projects.get(actor, id)),
                actor == null ? null : actor.id(),
                id);
    }

    private ProjectPage page(ResearchCatalog.ProjectView project) {
        return new ProjectPage(project, funding.forProject(project.id()));
    }

    public record ProjectPage(ResearchCatalog.ProjectView project, FundingSummary funding) {}
}
