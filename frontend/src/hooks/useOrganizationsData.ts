import { groupProjectsByOrganization } from "../lib/organizations";
import { useCatalogData } from "./useCatalogData";

export function useOrganizationsData() {
  const { items, organizations, loading, error, reload } = useCatalogData();

  const organizationsWithProjects = groupProjectsByOrganization(
    organizations,
    items,
  );

  return { organizations: organizationsWithProjects, loading, error, reload };
}
