import clsx from "clsx";
import { HandCoins, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatKopecks } from "../lib/format";
import type { ProjectPageItem } from "../types/api";

const VISUALS: Record<string, string> = {
  Медицина: "from-emerald-500 to-teal-700",
  Экология: "from-lime-500 to-green-700",
  "ИИ и данные": "from-violet-500 to-indigo-700",
  Материалы: "from-amber-400 to-orange-600",
  Космос: "from-sky-500 to-blue-800",
};

function ProjectCard({ project, funding }: ProjectPageItem) {
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={projectPath}
        className="relative block h-36 overflow-hidden bg-gradient-to-br"
        aria-label={`Открыть проект «${project.title}»`}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-gradient-to-br",
            VISUALS[project.category] ?? "from-green-600 to-green-900",
          )}
        />
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 size-28 rounded-full bg-white/10" />

        <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {project.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
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

        <div className="mt-auto pt-6">
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
            className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"
            role="meter"
            aria-label="Сбор средств"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-green-700 transition-[width]"
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
