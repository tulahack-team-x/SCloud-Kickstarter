import { useMemo } from "react";
import { groupProjectsByOrganization } from "../lib/organizations";
import { useCatalogData } from "./useCatalogData";

export function useOrganizationsData() {
  const { items, organizations, loading, error, reload } = useCatalogData();

  const organizationsWithProjects = useMemo(
    () => groupProjectsByOrganization(organizations, items),
    [organizations, items],
  );

  return { organizations: organizationsWithProjects, loading, error, reload };
}
