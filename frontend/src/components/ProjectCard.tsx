import clsx from "clsx";
import { Building2, HandCoins, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatKopecks } from "../lib/format";
import type { ProjectPageItem } from "../types/api";

const VISUALS: Record<string, string> = {
  Медицина: "from-emerald-100 via-teal-100 to-emerald-200",
  Экология: "from-lime-100 via-green-100 to-lime-200",
  "ИИ и данные": "from-violet-100 via-purple-100 to-violet-200",
  Материалы: "from-amber-100 via-orange-100 to-amber-200",
  Космос: "from-sky-100 via-blue-100 to-sky-200",
};

const BADGES: Record<string, string> = {
  Медицина: "bg-emerald-300/90 text-emerald-950",
  Экология: "bg-lime-300/90 text-lime-950",
  "ИИ и данные": "bg-violet-300/90 text-violet-950",
  Материалы: "bg-amber-300/90 text-amber-950",
  Космос: "bg-sky-300/90 text-sky-950",
};

type ProjectCardProps = ProjectPageItem & {
  teamName?: string;
};

function ProjectCard({ project, funding, teamName }: ProjectCardProps) {
  const projectPath = `/projects/${project.id}`;
  const goalKopecks = project.stages.reduce(
    (total, stage) => total + stage.budgetKopecks,
    0,
  );
  const progress =
    goalKopecks > 0
      ? Math.min(100, Math.round((funding.amountKopecks / goalKopecks) * 100))
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={projectPath}
        className="relative block h-40 overflow-hidden bg-gradient-to-br"
        aria-label={`Открыть проект «${project.title}»`}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br",
            VISUALS[project.category] ?? "from-green-100 to-green-200",
          )}
        />
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/30" />
        <div className="absolute -bottom-10 -left-6 size-28 rounded-full bg-white/30" />

        <span
          className={clsx(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur",
            BADGES[project.category] ?? "bg-green-300/90 text-green-950",
          )}
        >
          {project.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-xl font-bold leading-tight text-stone-950">
          <Link
            to={projectPath}
            className="transition-colors hover:text-green-800"
          >
            {project.title}
          </Link>
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
          {project.summary}
        </p>

        <div className="mt-auto pt-7">
          {teamName && (
            <p className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <Building2 className="size-3.5" aria-hidden="true" />
              {teamName}
            </p>
          )}

          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black text-stone-950">
                {formatKopecks(funding.amountKopecks)}
              </p>
              <p className="text-xs text-stone-500">
                из {formatKopecks(goalKopecks)}
              </p>
            </div>
            <span className="text-sm font-bold text-green-800">
              {progress}%
            </span>
          </div>

          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"
            role="meter"
            aria-label="Сбор средств"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-green-600 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <HandCoins className="size-4" aria-hidden="true" />
              <span className="sr-only">Взносы:</span>
              {funding.contributions}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4" aria-hidden="true" />
              <span className="sr-only">Участники:</span>
              {funding.contributors}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
