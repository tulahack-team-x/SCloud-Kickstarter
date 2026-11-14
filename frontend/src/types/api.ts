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


export type AccountRole = "CUSTOMER" | "SPONSOR" | "RESEARCHER";

export interface AccountView {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
}

export interface Profile {
  account: AccountView;
  organizations: OrganizationView[];
}

export interface TeamMemberDraft {
  name: string;
  position: string;
}

export interface TeamDraft {
  name: string;
  institution?: string;
  city?: string;
  direction: string;
  description: string;
  skills?: string;
  equipment?: string;
  members?: TeamMemberDraft[];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  company?: string;
  team?: TeamDraft;
}


export interface ContributionView {
  id: string;
  projectId: string;
  userId: string;
  amountKopecks: number;
  status: string;
  createdAt: string;
  version: number;
}

export interface Rank {
  name: string;
  thresholdKopecks: number;
}

export interface Impact {
  funding: FundingSummary;
  rank: Rank;
  nextRank: Rank | null;
  achievements: string[];
}

export interface OrderStageView {
  id: string;
  orderId: string;
  position: number;
  title: string;
  result: string;
  acceptance: string;
  weeks: number;
  budgetKopecks: number;
  status: string;
  currentReportId?: string | null;
  version: number;
}

export interface OrderView {
  id: string;
  requestId: string;
  proposalId: string;
  customerId: string;
  organizationId: string;
  title: string;
  status: string;
  version: number;
  createdAt: string;
  stages: OrderStageView[];
}
