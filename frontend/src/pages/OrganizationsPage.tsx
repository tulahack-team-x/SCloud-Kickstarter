import { Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import CategoryButton from "../components/CategoryButton";
import OrganizationCard from "../components/OrganizationCard";
import Spinner from "../components/Spinner";
import { useOrganizationsData } from "../hooks/useOrganizationsData";
import { getOrganizationTypeLabel } from "../lib/organizations";

const ALL_TYPES = "Все";

function OrganizationsPage() {
  const { organizations, loading, error, reload } = useOrganizationsData();

  const [query, setQuery] = useState("");
  const [type, setType] = useState(ALL_TYPES);

  const deferredQuery = useDeferredValue(query);

  const types = new Map<string, string>();
  organizations.forEach(({ organization }) => {
    types.set(organization.type, getOrganizationTypeLabel(organization.type));
  });

  const typeOptions = [
    { value: ALL_TYPES, label: ALL_TYPES },
    ...Array.from(types, ([value, label]) => ({ value, label })),
  ];

  const search = deferredQuery.trim().toLocaleLowerCase("ru");
  const filtered = organizations.filter(({ organization, projects }) => {
    const matchesType = type === ALL_TYPES || organization.type === type;
    const projectTitles = projects
      .map(({ project }) => project.title)
      .join(" ");
    const haystack =
      `${organization.name} ${organization.direction ?? ""} ${organization.institution ?? ""} ${organization.city ?? ""} ${organization.description ?? ""} ${projectTitles}`.toLocaleLowerCase(
        "ru",
      );

    return matchesType && (!search || haystack.includes(search));
  });

  const hasFilters = query.trim() !== "" || type !== ALL_TYPES;

  function resetFilters() {
    setQuery("");
    setType(ALL_TYPES);
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-4xl font-black tracking-tight">Организации</h1>
      </div>

      <div className="mt-10 space-y-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию, направлению или проекту"
            aria-label="Поиск организаций"
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

        <div className="flex flex-wrap items-center gap-2.5">
          {typeOptions.map((option) => (
            <CategoryButton
              key={option.value}
              label={option.label}
              isActive={type === option.value}
              onClick={() => setType(option.value)}
            />
          ))}

          {hasFilters && (
            <IconButton
              label="Сбросить фильтры"
              onClick={resetFilters}
              className="ml-1 text-stone-400"
            >
              <X className="size-4" aria-hidden="true" />
            </IconButton>
          )}
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

      {!loading && !error && organizations.length === 0 && (
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-10 text-center">
          <p className="font-bold text-stone-900">Пока нет организаций</p>
          <p className="mt-1 text-sm text-stone-500">
            Как только команды появятся, они будут здесь.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        organizations.length > 0 &&
        filtered.length === 0 && (
          <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <p className="font-bold text-stone-900">Ничего не найдено</p>
            <p className="mt-1 text-sm text-stone-500">
              Попробуйте изменить запрос или тип организации.
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
          {filtered.map(({ organization, projects }) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
              projects={projects}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default OrganizationsPage;
