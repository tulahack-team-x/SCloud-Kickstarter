import { FolderKanban, MapPin, Star, Users } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import OrganizationEditForm from "../components/OrganizationEditForm";
import ResearchRequestForm from "../components/ResearchRequestForm";
import { BackLink, PageError, PageLoading } from "../components/PageState";
import ProjectCard from "../components/ProjectCard";
import { useApiResource } from "../hooks/useApiResource";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../lib/format";
import {
  getOrganizationInitials,
  getOrganizationLocation,
  getOrganizationTypeLabel,
} from "../lib/organizations";
import type {
  MemberView,
  OrganizationView,
  PageSlice,
  ProjectPageItem,
  ReviewView,
} from "../types/api";

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            index < value ? "size-3.5 fill-current" : "size-3.5 text-stone-300"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function OrganizationDetails({ id }: { id: string }) {
  const { user, organizations: ownedOrganizations } = useAuth();
  const [editing, setEditing] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const organizationResource = useApiResource<OrganizationView>(
    `/organizations/${id}`,
  );
  const membersResource = useApiResource<PageSlice<MemberView>>(
    `/organizations/${id}/members?limit=100`,
  );
  const projectsResource = useApiResource<PageSlice<ProjectPageItem>>(
    "/projects?limit=100",
  );
  const reviewsResource = useApiResource<PageSlice<ReviewView>>(
    `/organizations/${id}/reviews?limit=20`,
  );

  if (
    organizationResource.loading ||
    membersResource.loading ||
    projectsResource.loading ||
    reviewsResource.loading
  ) {
    return <PageLoading />;
  }

  const error =
    organizationResource.error ??
    membersResource.error ??
    projectsResource.error ??
    reviewsResource.error;

  if (error || !organizationResource.data) {
    return (
      <section className="mx-auto max-w-2xl">
        <BackLink to="/organizations">Ко всем организациям</BackLink>
        <div className="mt-6">
          <PageError
            message={error ?? "Организация не найдена"}
            onRetry={() => {
              organizationResource.reload();
              membersResource.reload();
              projectsResource.reload();
              reviewsResource.reload();
            }}
          />
        </div>
      </section>
    );
  }

  const organization = organizationResource.data;
  const members = membersResource.data?.items ?? [];
  const projects = (projectsResource.data?.items ?? []).filter(
    ({ project }) => project.organizationId === organization.id,
  );
  const reviews = reviewsResource.data?.items ?? [];
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((total, review) => total + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;
  const location = getOrganizationLocation(organization);
  const isOwner =
    !!user &&
    ownedOrganizations.some(
      (ownedOrganization) => ownedOrganization.id === organization.id,
    );
  const isCustomer = user?.role === "CUSTOMER";

  return (
    <section>
      <BackLink to="/organizations">Ко всем организациям</BackLink>

      <div className="mt-6 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-green-100 text-lg font-black text-green-900">
            {getOrganizationInitials(organization.name)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-black leading-tight tracking-tight text-stone-950">
              {organization.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green-800">
                {getOrganizationTypeLabel(organization.type)}
              </span>
              {location && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {location}
                </span>
              )}
            </div>

            {organization.direction && (
              <p className="mt-4 text-sm font-semibold text-stone-700">
                {organization.direction}
              </p>
            )}

            {organization.description && (
              <p className="mt-2 max-w-3xl text-sm leading-7 text-stone-600">
                {organization.description}
              </p>
            )}
          </div>

          {isOwner && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          )}

          {isCustomer && organization.type === "SCIENTIFIC" && !requesting && (
            <Button
              onClick={() => {
                setRequesting(true);
                setRequestSent(false);
              }}
            >
              Предложить задачу
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-3 border-t border-stone-100 pt-5 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-stone-600">
            <Users className="size-4 text-stone-400" aria-hidden="true" />
            <span className="font-semibold text-stone-950">
              {members.length}
            </span>
            участников
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <FolderKanban
              className="size-4 text-stone-400"
              aria-hidden="true"
            />
            <span className="font-semibold text-stone-950">
              {projects.length}
            </span>
            исследований
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            {averageRating ? (
              <>
                <Rating value={Math.round(Number(averageRating))} />
                <span className="font-semibold text-stone-950">
                  {averageRating}
                </span>
                · {reviews.length} отзывов
              </>
            ) : (
              "Пока нет отзывов"
            )}
          </div>
        </div>
      </div>

      {requestSent && (
        <p className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
          Запрос отправлен команде.
        </p>
      )}

      {(organization.skills || organization.equipment) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {organization.skills && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Навыки
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {organization.skills}
              </p>
            </div>
          )}
          {organization.equipment && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                Оборудование
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                {organization.equipment}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold text-stone-950">Исследования</h2>

            {projects.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Опубликованных исследований пока нет.
              </p>
            ) : (
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {projects.map(({ project, funding }) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    funding={funding}
                    teamName={organization.name}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">Отзывы</h2>

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Пока нет отзывов.</p>
            ) : (
              <ul className="mt-5 space-y-5">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="border-b border-stone-100 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Rating value={review.rating} />
                      <span className="text-xs text-stone-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {review.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-950">Участники</h2>

            {members.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Участников пока нет.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-100">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {member.position}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Редактировать организацию"
      >
        <OrganizationEditForm
          organization={organization}
          onSaved={() => {
            setEditing(false);
            organizationResource.reload();
            membersResource.reload();
          }}
          onCancel={() => setEditing(false)}
        />
      </Modal>

      <Modal
        open={requesting}
        onClose={() => setRequesting(false)}
        title="Предложить задачу"
      >
        <ResearchRequestForm
          organizationId={organization.id}
          onCreated={() => {
            setRequesting(false);
            setRequestSent(true);
          }}
          onCancel={() => setRequesting(false)}
        />
      </Modal>
    </section>
  );
}

function OrganizationPage() {
  const { id } = useParams();

  if (!id) {
    return <p className="text-sm text-stone-500">Организация не найдена.</p>;
  }

  return <OrganizationDetails key={id} id={id} />;
}

export default OrganizationPage;
