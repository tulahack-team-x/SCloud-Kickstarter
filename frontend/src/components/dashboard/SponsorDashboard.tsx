import { HandCoins, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button";
import { useApiResource } from "../../hooks/useApiResource";
import { formatKopecks } from "../../lib/format";
import type {
  ContributionView,
  Impact,
  PageSlice,
  ProjectPageItem,
} from "../../types/api";
import {
  Badge,
  DashboardError,
  DashboardLoading,
  ProgressBar,
  Section,
  StatCard,
} from "./ui";

function SponsorDashboard() {
  const contributionsResource = useApiResource<PageSlice<ContributionView>>(
    "/me/contributions?limit=100",
  );
  const impactResource = useApiResource<Impact>("/me/impact");
  const projectsResource = useApiResource<PageSlice<ProjectPageItem>>(
    "/projects?limit=100",
  );

  if (
    contributionsResource.loading ||
    impactResource.loading ||
    projectsResource.loading
  ) {
    return <DashboardLoading />;
  }

  const error =
    contributionsResource.error ??
    impactResource.error ??
    projectsResource.error;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={() => {
          contributionsResource.reload();
          impactResource.reload();
          projectsResource.reload();
        }}
      />
    );
  }

  const impact = impactResource.data;
  const contributions = contributionsResource.data?.items ?? [];
  const projects = new Map(
    (projectsResource.data?.items ?? []).map(({ project }) => [
      project.id,
      project,
    ]),
  );

  const grouped = new Map<string, { amountKopecks: number; count: number }>();

  contributions
    .filter((contribution) => contribution.status === "CONFIRMED")
    .forEach((contribution) => {
      const current = grouped.get(contribution.projectId) ?? {
        amountKopecks: 0,
        count: 0,
      };

      grouped.set(contribution.projectId, {
        amountKopecks: current.amountKopecks + contribution.amountKopecks,
        count: current.count + 1,
      });
    });

  const supported = Array.from(grouped, ([projectId, value]) => ({
    projectId,
    project: projects.get(projectId),
    ...value,
  })).sort((a, b) => b.amountKopecks - a.amountKopecks);

  if (!impact) {
    return (
      <DashboardError
        message="Не удалось загрузить профиль"
        onRetry={impactResource.reload}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Поддержано проектов"
          value={supported.length}
          icon={Target}
        />
        <StatCard
          label="Вложено средств"
          value={formatKopecks(impact.funding.amountKopecks)}
          icon={HandCoins}
        />
        <StatCard label="Ранг" value={impact.rank.name} icon={Trophy} />
        <StatCard
          label="Достижения"
          value={impact.achievements.length}
          icon={Sparkles}
        />
      </div>

      <Section title="Ранг и достижения">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-green-100 text-green-800">
            <Trophy className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-stone-950">
              {impact.rank.name}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {impact.nextRank
                ? `До «${impact.nextRank.name}» осталось ${formatKopecks(
                    impact.nextRank.thresholdKopecks -
                      impact.funding.amountKopecks,
                  )}`
                : "Максимальный ранг"}
            </p>
          </div>
        </div>

        {impact.nextRank && (
          <div className="mt-5">
            <ProgressBar
              value={impact.funding.amountKopecks}
              max={impact.nextRank.thresholdKopecks}
              label="Прогресс до следующего ранга"
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {impact.achievements.length > 0 ? (
            impact.achievements.map((achievement) => (
              <Badge key={achievement} tone="green">
                {achievement}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-stone-500">Пока нет достижений.</p>
          )}
        </div>
      </Section>

      <Section
        title="Поддержанные проекты"
        action={
          <Button asChild variant="secondary" compact>
            <Link to="/">Найти проекты</Link>
          </Button>
        }
      >
        {supported.length === 0 ? (
          <p className="text-sm text-stone-500">
            Поддержанных проектов пока нет.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {supported.map((item) => (
              <li
                key={item.projectId}
                className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  {item.project ? (
                    <Link
                      to={`/projects/${item.project.id}`}
                      className="font-semibold text-stone-950 transition-colors hover:text-green-800"
                    >
                      {item.project.title}
                    </Link>
                  ) : (
                    <p className="font-semibold text-stone-950">Проект</p>
                  )}
                  <p className="mt-1 text-xs text-stone-500">
                    {item.project?.category ?? "Исследование"} · {item.count}{" "}
                    взносов
                  </p>
                </div>

                <p className="font-bold text-stone-950">
                  {formatKopecks(item.amountKopecks)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export default SponsorDashboard;
