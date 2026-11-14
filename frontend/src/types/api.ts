export interface PageSlice<T> {
  items: T[];
  offset: number;
  hasMore: boolean;
}

export interface FundingSummary {
  amountKopecks: number;
  contributors: number;
  contributions: number;
}

export interface StageView {
  id: string;
  position: number;
  title: string;
  result: string;
  acceptance: string;
  weeks: number;
  budgetKopecks: number;
}

export interface ProjectView {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  summary: string;
  hypothesis: string;
  method: string;
  result: string;
  risks: string;
  visibility: "PUBLIC" | "PRIVATE";
  status: string;
  version: number;
  createdAt: string;
  stages: StageView[];
}

export interface ProjectPageItem {
  project: ProjectView;
  funding: FundingSummary;
}

export interface MemberView {
  id: string;
  userId?: string | null;
  name: string;
  position: string;
  accessRole: string;
}

export interface OrganizationView {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  institution?: string;
  city?: string;
  direction?: string;
  description?: string;
  skills?: string;
  equipment?: string;
  version: number;
  members: MemberView[];
}
