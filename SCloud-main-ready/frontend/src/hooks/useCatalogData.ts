import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type {
  OrganizationView,
  PageSlice,
  ProjectPageItem,
} from "../types/api";

export function useCatalogData() {
  const [items, setItems] = useState<ProjectPageItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        const [projects, orgs] = await Promise.all([
          apiFetch<PageSlice<ProjectPageItem>>("/projects?limit=100"),
          apiFetch<PageSlice<OrganizationView>>("/organizations?limit=100"),
        ]);

        if (!cancelled) {
          setItems(projects.items);
          setOrganizations(orgs.items);
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

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  function reload() {
    setLoading(true);
    setError(null);
    setRequestId((current) => current + 1);
  }

  return { items, organizations, loading, error, reload };
}
