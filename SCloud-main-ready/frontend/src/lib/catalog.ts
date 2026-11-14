import type { ProjectPageItem } from "../types/api";

export const ALL_CATEGORIES = "Все";

export type SortOption = "newest" | "funded" | "contributions";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "funded", label: "Больше собрано" },
  { value: "contributions", label: "Больше взносов" },
];

type FilterOptions = {
  items: ProjectPageItem[];
  organizations: Map<string, string>;
  query: string;
  category: string;
  sort: SortOption;
};

export function getCategories(items: ProjectPageItem[]): string[] {
  const unique = Array.from(
    new Set(items.map(({ project }) => project.category)),
  ).sort((a, b) => a.localeCompare(b, "ru"));

  return [ALL_CATEGORIES, ...unique];
}

export function filterProjects({
  items,
  organizations,
  query,
  category,
  sort,
}: FilterOptions): ProjectPageItem[] {
  const search = query.trim().toLocaleLowerCase("ru");

  const filtered = items.filter(({ project }) => {
    const matchesCategory =
      category === ALL_CATEGORIES || project.category === category;
    const teamName = organizations.get(project.organizationId) ?? "";
    const haystack =
      `${project.title} ${project.summary} ${project.category} ${project.hypothesis} ${teamName}`.toLocaleLowerCase(
        "ru",
      );

    return matchesCategory && (!search || haystack.includes(search));
  });

  return filtered.sort((a, b) => {
    if (sort === "funded") {
      return b.funding.amountKopecks - a.funding.amountKopecks;
    }

    if (sort === "contributions") {
      return b.funding.contributions - a.funding.contributions;
    }

    return b.project.createdAt.localeCompare(a.project.createdAt);
  });
}
