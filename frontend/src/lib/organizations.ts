import type { OrganizationView, ProjectPageItem } from "../types/api";

const TYPE_LABELS: Record<string, string> = {
  SCIENTIFIC: "Научная команда",
  COMPANY: "Компания",
};

export type OrganizationWithProjects = {
  organization: OrganizationView;
  projects: ProjectPageItem[];
};

export function getOrganizationTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function getOrganizationLocation(
  organization: OrganizationView,
): string {
  return [organization.city, organization.institution]
    .filter(Boolean)
    .join(" · ");
}

export function getOrganizationProjects(
  organizationId: string,
  projects: ProjectPageItem[],
): ProjectPageItem[] {
  return projects.filter(
    ({ project }) => project.organizationId === organizationId,
  );
}

export function groupProjectsByOrganization(
  organizations: OrganizationView[],
  projects: ProjectPageItem[],
): OrganizationWithProjects[] {
  return organizations.map((organization) => ({
    organization,
    projects: getOrganizationProjects(organization.id, projects),
  }));
}
