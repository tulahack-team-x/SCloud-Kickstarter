import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import Button from "../components/Button";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";
import { useCatalogData } from "../hooks/useCatalogData";
import {
  ALL_CATEGORIES,
  filterProjects,
  getCategories,
  SORT_OPTIONS,
  type SortOption,
} from "../lib/catalog";

function CatalogPage() {
  const { items, organizations, loading, error, reload } = useCatalogData();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [sort, setSort] = useState<SortOption>("newest");

  const deferredQuery = useDeferredValue(query);

  const organizationNames = useMemo(
    () => new Map(organizations.map((org) => [org.id, org.name])),
    [organizations],
  );

  const categories = useMemo(() => getCategories(items), [items]);

  const filtered = useMemo(
    () =>
      filterProjects({
        items,
        organizations: organizationNames,
        query: deferredQuery,
        category,
        sort,
      }),
    [items, organizationNames, deferredQuery, category, sort],
  );

  const hasFilters =
    query.trim() !== "" || category !== ALL_CATEGORIES || sort !== "newest";

  function resetFilters() {
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setSort("newest");
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Исследования</h1>
        </div>
      </div>

      <div className="mt-10 space-y-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию, описанию или категории"
              aria-label="Поиск исследований"
              className="focus-ring w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-10 text-sm text-stone-900 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Очистить поиск"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 transition-colors hover:text-stone-700"
              >
                <X className="size-4" />
              </button>
            )}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
              className={clsx(
                "rounded-full border px-4 py-2 text-xs font-bold transition-colors",
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

          <span className="flex-1"></span>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="focus-ring rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-semibold text-stone-900 transition"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="mt-12 flex items-center justify-center">
          <Spinner className="size-6 text-green-800" />
        </div>
      )}

      {!loading && error && (
        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={reload}>Повторить</Button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-bold text-stone-900">
            Пока нет опубликованных исследований
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Как только проекты появятся в каталоге, они будут здесь.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && filtered.length === 0 && (
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-10 text-center">
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ project, funding }) => (
            <ProjectCard
              key={project.id}
              project={project}
              funding={funding}
              teamName={organizationNames.get(project.organizationId)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default CatalogPage;
