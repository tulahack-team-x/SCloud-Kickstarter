import { ClipboardList, FlaskConical, HandCoins, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../Button";
import { useApiResource } from "../../hooks/useApiResource";
import { useAuth } from "../../hooks/useAuth";
import { getOrganizationTypeLabel } from "../../lib/organizations";
import {
  getLabel,
  getOrderBudgetKopecks,
  ORDER_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type {
  OrderView,
  OrganizationView,
  PageSlice,
  ProjectPageItem,
  ProjectView,
} from "../../types/api";
import {
  Badge,
  DashboardError,
  DashboardLoading,
  ProgressBar,
  Section,
  StatCard,
} from "./ui";

function ResearcherDashboard() {
  const { organizations: ownedOrganizations } = useAuth();

  const projectsResource = useApiResource<PageSlice<ProjectView>>(
    "/me/projects?limit=100",
  );
  const catalogResource = useApiResource<PageSlice<ProjectPageItem>>(
    "/projects?limit=100",
  );
  const ordersResource =
    useApiResource<PageSlice<OrderView>>("/orders?limit=100");
  const organizationsResource = useApiResource<PageSlice<OrganizationView>>(
    "/organizations?limit=100",
  );

  if (
    projectsResource.loading ||
    catalogResource.loading ||
    ordersResource.loading ||
    organizationsResource.loading
  ) {
    return <DashboardLoading />;
  }

  const error =
    projectsResource.error ??
    catalogResource.error ??
    ordersResource.error ??
    organizationsResource.error;

  if (error) {
    return (
      <DashboardError
        message={error}
        onRetry={() => {
          projectsResource.reload();
          catalogResource.reload();
          ordersResource.reload();
          organizationsResource.reload();
        }}
      />
    );
  }

  const projects = projectsResource.data?.items ?? [];
  const orders = ordersResource.data?.items ?? [];
  const fundingByProject = new Map(
    (catalogResource.data?.items ?? []).map(({ project, funding }) => [
      project.id,
      funding,
    ]),
  );
  const organizationNames = new Map(
    (organizationsResource.data?.items ?? []).map((org) => [org.id, org.name]),
  );

  const publishedProjects = projects.filter(
    (project) => project.status === "PUBLISHED",
  ).length;
  const totalRaised = projects.reduce(
    (total, project) =>
      total + (fundingByProject.get(project.id)?.amountKopecks ?? 0),
    0,
  );
  const totalGoal = projects.reduce(
    (total, project) =>
      total +
      project.stages.reduce(
        (stageTotal, stage) => stageTotal + stage.budgetKopecks,
        0,
      ),
    0,
  );
  const activeOrders = orders.filter(
    (order) => order.status === "ACTIVE",
  ).length;
  const members = ownedOrganizations.reduce(
    (total, organization) => total + organization.members.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Исследования"
          value={projects.length}
          sub={`${publishedProjects} опубликовано`}
          icon={FlaskConical}
        />
        <StatCard
          label="Собрано"
          value={formatKopecks(totalRaised)}
          sub={`из ${formatKopecks(totalGoal)}`}
          icon={HandCoins}
        />
        <StatCard
          label="Заказы"
          value={orders.length}
          sub={`${activeOrders} в работе`}
          icon={ClipboardList}
        />
        <StatCard
          label="Команды"
          value={ownedOrganizations.length}
          sub={`${members} участников`}
          icon={Users}
        />
      </div>

      {totalGoal > 0 && (
        <Section title="Финансирование">
          <ProgressBar
            value={totalRaised}
            max={totalGoal}
            label="Собрано по проектам"
          />
        </Section>
      )}

      <Section
        title="Мои исследования"
        action={
          <Button asChild variant="secondary" compact>
            <Link to="/">Каталог</Link>
          </Button>
        }
      >
        {projects.length === 0 ? (
          <p className="text-sm text-stone-500">Проектов пока нет.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {projects.map((project) => {
              const funding = fundingByProject.get(project.id);

              return (
                <li
                  key={project.id}
                  className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="font-semibold text-stone-950 transition-colors hover:text-green-800"
                    >
                      {project.title}
                    </Link>
                    <p className="mt-1 text-xs text-stone-500">
                      {project.category} · Этапов: {project.stages.length}
                    </p>
                  </div>

                  <div className="text-right">
                    {funding && (
                      <p className="font-bold text-stone-950">
                        {formatKopecks(funding.amountKopecks)}
                      </p>
                    )}
                    <div className="mt-1">
                      <Badge
                        tone={
                          project.status === "PUBLISHED" ? "green" : "amber"
                        }
                      >
                        {getLabel(PROJECT_STATUS_LABELS, project.status)}
                      </Badge>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Заказы">
        {orders.length === 0 ? (
          <p className="text-sm text-stone-500">Заказов пока нет.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-stone-950">{order.title}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    {organizationNames.get(order.organizationId) ??
                      "Организация"}{" "}
                    · {order.stages.length} этапов
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-stone-950">
                    {formatKopecks(getOrderBudgetKopecks(order))}
                  </p>
                  <div className="mt-1">
                    <Badge tone={order.status === "ACTIVE" ? "green" : "sky"}>
                      {getLabel(ORDER_STATUS_LABELS, order.status)}
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Команды">
        {ownedOrganizations.length === 0 ? (
          <p className="text-sm text-stone-500">Команд пока нет.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {ownedOrganizations.map((organization) => (
              <li
                key={organization.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <Link
                    to={`/organizations/${organization.id}`}
                    className="font-semibold text-stone-950 transition-colors hover:text-green-800"
                  >
                    {organization.name}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">
                    {getOrganizationTypeLabel(organization.type)}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                  <Users className="size-4" aria-hidden="true" />
                  {organization.members.length}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export default ResearcherDashboard;
