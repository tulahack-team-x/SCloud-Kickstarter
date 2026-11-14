import { Building2, HandCoins, Users } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/Button";
import ContributionForm from "../components/ContributionForm";
import ResearchRequestForm from "../components/ResearchRequestForm";
import { BackLink, PageError, PageLoading } from "../components/PageState";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import { formatDate, formatKopecks } from "../lib/format";
import { getOrganizationInitials, getOrganizationLocation, getOrganizationTypeLabel } from "../lib/organizations";
import type {
  OrganizationView,
  PageSlice,
  ProjectPageItem,
  ProjectUpdateView,
  ProjectView,
} from "../types/api";

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-stone-950">{title}</h2>
      <div className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
        {children}
      </div>
    </section>
  );
}

function ProjectDetails({ id }: { id: string }) {
  const { user, organizations: ownedOrganizations } = useAuth();
  const [showSupport, setShowSupport] = useState(false);
  const [supportThanks, setSupportThanks] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showRequest, setShowRequest] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const projectResource = useApiResource<ProjectPageItem>(`/projects/${id}`);
  const updatesResource = useApiResource<PageSlice<ProjectUpdateView>>(
    `/projects/${id}/updates?limit=20`,
  );
  const projectItem = projectResource.data;
  const organizationResource = useApiResource<OrganizationView>(
    projectItem ? `/organizations/${projectItem.project.organizationId}` : null,
  );

  if (
    projectResource.loading ||
    updatesResource.loading ||
    organizationResource.loading
  ) {
    return <PageLoading />;
  }

  const error =
    projectResource.error ??
    updatesResource.error ??
    organizationResource.error;

  if (error || !projectItem) {
    return (
      <section className="mx-auto max-w-2xl">
        <BackLink to="/">Ко всем исследованиям</BackLink>
        <div className="mt-6">
          <PageError
            message={error ?? "Проект не найден"}
            onRetry={() => {
              projectResource.reload();
              updatesResource.reload();
              organizationResource.reload();
            }}
          />
        </div>
      </section>
    );
  }

  const { project, funding } = projectItem;
  const organization = organizationResource.data;
  const updates = updatesResource.data?.items ?? [];
  const goalKopecks = project.stages.reduce(
    (total, stage) => total + stage.budgetKopecks,
    0,
  );
  const progress =
    goalKopecks > 0
      ? Math.min(100, Math.round((funding.amountKopecks / goalKopecks) * 100))
      : 0;
  const isOwner =
    !!user &&
    ownedOrganizations.some(
      (ownedOrganization) => ownedOrganization.id === project.organizationId,
    );
  const canSupport =
    !!user &&
    user.role === "SPONSOR" &&
    project.visibility === "PUBLIC" &&
    project.status === "PUBLISHED";

  async function publishProject() {
    setPublishing(true);
    setPublishError(null);

    try {
      await apiFetch<ProjectView>(`/projects/${project.id}/publication`, {
        method: "POST",
        body: JSON.stringify({ expectedVersion: project.version }),
      });

      projectResource.reload();
      updatesResource.reload();
    } catch (err) {
      setPublishError(
        getApiErrorMessage(err, "Не удалось опубликовать проект"),
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section>
      <BackLink to="/">Ко всем исследованиям</BackLink>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-green-800">
                {project.category}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                {project.status === "PUBLISHED" ? "Опубликован" : project.status}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-stone-950">
              {project.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              {project.summary}
            </p>

            {organization && (
              <Link
                to={`/organizations/${organization.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-green-800"
              >
                <Building2 className="size-4" aria-hidden="true" />
                {organization.name}
              </Link>
            )}

            {user?.role === "CUSTOMER" &&
              organization &&
              !showRequest &&
              !requestSent && (
                <div className="mt-5">
                  <Button onClick={() => setShowRequest(true)}>
                    Предложить задачу
                  </Button>
                </div>
              )}
          </div>

          {showRequest && organization && (
            <ResearchRequestForm
              organizationId={organization.id}
              onCreated={() => {
                setShowRequest(false);
                setRequestSent(true);
              }}
              onCancel={() => setShowRequest(false)}
            />
          )}

          {requestSent && (
            <p className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
              Запрос отправлен команде.
            </p>
          )}

          <InfoBlock title="Гипотеза">{project.hypothesis}</InfoBlock>
          <InfoBlock title="Методика">{project.method}</InfoBlock>
          <InfoBlock title="Ожидаемый результат">{project.result}</InfoBlock>
          <InfoBlock title="Риски">{project.risks}</InfoBlock>

          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">Этапы</h2>

            {project.stages.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Этапы пока не добавлены.</p>
            ) : (
              <ol className="mt-5 space-y-5">
                {project.stages.map((stage, index) => (
                  <li key={stage.id} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-50 text-xs font-bold text-green-800">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-semibold text-stone-950">{stage.title}</p>
                        <span className="text-xs text-stone-500">
                          {stage.weeks} нед.
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {stage.result}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        Бюджет: {formatKopecks(stage.budgetKopecks)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">Обновления</h2>

            {updates.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Обновлений пока нет.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {updates.map((update) => (
                  <li
                    key={update.id}
                    className="rounded-xl border border-stone-100 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-stone-950">
                        {update.title}
                      </p>
                      <span className="text-xs text-stone-500">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {update.text}
                    </p>
                    {update.completed && (
                      <span className="mt-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-800">
                        Завершено
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-800">
              Сбор средств
            </p>
            <p className="mt-3 text-2xl font-black text-stone-950">
              {formatKopecks(funding.amountKopecks)}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              из {formatKopecks(goalKopecks)}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-green-600"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <HandCoins className="size-4" aria-hidden="true" />
                {funding.contributions}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" aria-hidden="true" />
                {funding.contributors}
              </span>
            </div>

            {supportThanks && (
              <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
                Спасибо за поддержку!
              </p>
            )}

            {canSupport && (
              <div className="mt-4">
                {showSupport ? (
                  <ContributionForm
                    projectId={project.id}
                    onContributed={() => {
                      setShowSupport(false);
                      setSupportThanks(true);
                      projectResource.reload();
                    }}
                  />
                ) : (
                  <Button
                    className="w-full justify-center"
                    onClick={() => {
                      setShowSupport(true);
                      setSupportThanks(false);
                    }}
                  >
                    Поддержать проект
                  </Button>
                )}
              </div>
            )}

            {!user &&
              project.visibility === "PUBLIC" &&
              project.status === "PUBLISHED" && (
                <Button asChild variant="secondary" className="mt-4 w-full justify-center">
                  <Link to="/login">Войти, чтобы поддержать</Link>
                </Button>
              )}
          </div>

          {isOwner && project.status === "DRAFT" && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-stone-950">
                Проект не опубликован
              </p>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Опубликуйте проект, чтобы он появился в каталоге.
              </p>

              {publishError && (
                <p className="mt-3 text-xs text-red-600">{publishError}</p>
              )}

              <Button
                className="mt-4 w-full justify-center"
                disabled={publishing}
                onClick={() => void publishProject()}
              >
                {publishing ? "Публикуем..." : "Опубликовать"}
              </Button>

              <Button
                asChild
                variant="secondary"
                className="mt-2 w-full justify-center"
              >
                <Link to={`/projects/${project.id}/edit`}>
                  Редактировать
                </Link>
              </Button>
            </div>
          )}

          {organization && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green-100 text-xs font-black text-green-900">
                  {getOrganizationInitials(organization.name)}
                </span>
                <div className="min-w-0">
                  <Link
                    to={`/organizations/${organization.id}`}
                    className="font-bold text-stone-950 transition-colors hover:text-green-800"
                  >
                    {organization.name}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">
                    {getOrganizationTypeLabel(organization.type)}
                  </p>
                </div>
              </div>

              {getOrganizationLocation(organization) && (
                <p className="mt-4 text-xs text-stone-500">
                  {getOrganizationLocation(organization)}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function ProjectPage() {
  const { id } = useParams();

  if (!id) {
    return <p className="text-sm text-stone-500">Проект не найден.</p>;
  }

  return <ProjectDetails key={id} id={id} />;
}

export default ProjectPage;
