import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";
import { apiFetch } from "../lib/api";
import type { PageSlice, ProjectPageItem } from "../types/api";

type SortOption = "newest" | "funded" | "contributions";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "funded", label: "Больше собрано" },
  { value: "contributions", label: "Больше взносов" },
];

const ALL_CATEGORIES = "Все";

function CatalogPage() {
  const [items, setItems] = useState<ProjectPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [sort, setSort] = useState<SortOption>("newest");

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        const data = await apiFetch<PageSlice<ProjectPageItem>>(
          "/projects?limit=100",
        );

        if (!cancelled) {
          setItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить исследования",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(items.map(({ project }) => project.category)),
    ).sort((a, b) => a.localeCompare(b, "ru"));

    return [ALL_CATEGORIES, ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    const search = deferredQuery.trim().toLocaleLowerCase("ru");

    const result = items.filter(({ project }) => {
      const matchesCategory =
        category === ALL_CATEGORIES || project.category === category;
      const haystack =
        `${project.title} ${project.summary} ${project.category} ${project.hypothesis}`.toLocaleLowerCase(
          "ru",
        );

      return matchesCategory && (!search || haystack.includes(search));
    });

    return result.sort((a, b) => {
      if (sort === "funded") {
        return b.funding.amountKopecks - a.funding.amountKopecks;
      }

      if (sort === "contributions") {
        return b.funding.contributions - a.funding.contributions;
      }

      return b.project.createdAt.localeCompare(a.project.createdAt);
    });
  }, [items, deferredQuery, category, sort]);

  const hasFilters =
    query.trim() !== "" || category !== ALL_CATEGORIES || sort !== "newest";

  function reload() {
    setLoading(true);
    setError(null);
    setRequestId((current) => current + 1);
  }

  function resetFilters() {
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setSort("newest");
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Исследования
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Поддерживайте научные команды и следите за результатами в понятном
            формате.
          </p>
        </div>

        {!loading && !error && (
          <p className="text-sm text-stone-500">
            Найдено {filtered.length} из {items.length}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию, описанию или категории"
              aria-label="Поиск исследований"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 py-2.5 pl-9 pr-9 text-sm text-stone-900 outline-none transition focus:border-green-700 focus:bg-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Очистить поиск"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 transition-colors hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm text-stone-600">
            <span className="shrink-0">Сортировка</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 outline-none transition focus:border-green-700"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
                category === value
                  ? "border-green-800 bg-green-800 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-green-700 hover:text-green-800",
              )}
            >
              {value}
            </button>
          ))}

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-1 text-xs font-semibold text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center">
          <Spinner
            className="size-6 text-green-800"
            label="Загрузка исследований"
          />
        </div>
      )}

      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={reload}>Повторить</Button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-bold text-stone-900">
            Пока нет опубликованных исследований
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Как только проекты появятся в каталоге, они будут здесь.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-bold text-stone-900">Ничего не найдено</p>
          <p className="mt-1 text-sm text-stone-500">
            Попробуйте изменить запрос или категорию.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ project, funding }) => (
            <ProjectCard key={project.id} project={project} funding={funding} />
          ))}
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
