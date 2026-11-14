import { ArrowUpRight, FolderKanban, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getOrganizationInitials,
  getOrganizationLocation,
  getOrganizationTypeLabel,
} from "../lib/organizations";
import type { OrganizationWithProjects } from "../lib/organizations";

function OrganizationCard({
  organization,
  projects,
}: OrganizationWithProjects) {
  const location = getOrganizationLocation(organization);
  const organizationPath = `/organizations/${organization.id}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-green-100 text-sm font-black text-green-900">
          {getOrganizationInitials(organization.name)}
        </span>

        <div className="min-w-0">
          <h2 className="text-xl font-bold leading-tight text-stone-950">
            <Link
              to={organizationPath}
              className="transition-colors hover:text-green-800"
            >
              {organization.name}
            </Link>
          </h2>
          <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-green-800">
            {getOrganizationTypeLabel(organization.type)}
          </span>
        </div>
      </div>

      {location && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-500">
          <MapPin className="size-3.5" aria-hidden="true" />
          {location}
        </p>
      )}

      {organization.direction && (
        <p className="mt-3 text-sm font-semibold text-stone-700">
          {organization.direction}
        </p>
      )}

      {organization.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
          {organization.description}
        </p>
      )}

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-4 border-t border-stone-100 pt-4 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" aria-hidden="true" />
            <span className="sr-only">Участники:</span>
            {organization.members.length}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FolderKanban className="size-4" aria-hidden="true" />
            <span className="sr-only">Проекты:</span>
            {projects.length}
          </span>
        </div>

        {projects.length > 0 && (
          <div className="mt-4 space-y-2">
            {projects.slice(0, 3).map(({ project }) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center justify-between gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-green-800"
              >
                <span className="line-clamp-1">{project.title}</span>
                <ArrowUpRight
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}

            {projects.length > 3 && (
              <Link
                to={organizationPath}
                className="flex items-center gap-2 text-xs text-stone-500 transition-colors hover:text-green-800"
              >
                <ArrowUpRight
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <p>Все проекты</p>
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default OrganizationCard;
