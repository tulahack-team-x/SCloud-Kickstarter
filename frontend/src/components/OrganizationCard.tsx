import { ArrowUpRight, FolderKanban, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getOrganizationLocation } from "../lib/organizations";
import OrganizationIcon from "./OrganizationIcon";
import type { OrganizationWithProjects } from "../lib/organizations";

function OrganizationCard({
  organization,
  projects,
}: OrganizationWithProjects) {
  const location = getOrganizationLocation(organization);
  const organizationPath = `/organizations/${organization.id}`;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition duration-200 hover:brightness-[98%] hover:shadow-md">
      <Link
        to={organizationPath}
        aria-label={`Открыть организацию "${organization.name}"`}
        className="absolute inset-0 z-0 rounded-2xl focus-ring"
      />

      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-4">
          <OrganizationIcon type={organization.type} className="size-12" />

          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight text-stone-950">
              {organization.name}
            </h2>
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
                  className="pointer-events-auto relative z-20 flex items-center justify-between gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-green-800 focus-ring"
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
                  className="pointer-events-auto relative z-20 flex items-center gap-2 text-xs text-stone-500 transition-colors hover:text-green-800 focus-ring"
                >
                  <ArrowUpRight
                    className="size-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Все проекты</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default OrganizationCard;
