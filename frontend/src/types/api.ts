export interface PageSlice<T> {
  items: T[];
  offset: number;
  hasMore: boolean;
}

export type ProjectStatus = "DRAFT" | "PUBLISHED";
export type OrderStatus = "ACTIVE" | "COMPLETED";
export type StageStatus =
  | "PLANNED"
  | "WORKING"
  | "REVIEW"
  | "ACCEPTED"
  | "REVISION";
export type ContributionStatus = "PENDING" | "CONFIRMED";
export type RequestStatus = "SENT" | "PROPOSED" | "ACCEPTED";
export type OrganizationType = "SCIENTIFIC" | "COMPANY";

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
  status: ProjectStatus;
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
  type: OrganizationType;
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
  status: ContributionStatus;
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
  status: StageStatus;
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
  status: OrderStatus;
  version: number;
  createdAt: string;
  stages: OrderStageView[];
}


export interface ProjectUpdateView {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface ReviewView {
  id: string;
  orderId: string;
  authorId: string;
  subjectId: string;
  subjectType: string;
  rating: number;
  text: string;
  createdAt: string;
}


export interface ResearchRequestView {
  id: string;
  customerId: string;
  organizationId: string;
  title: string;
  description: string;
  budgetKopecks: number;
  weeks: number;
  status: RequestStatus;
  version: number;
  createdAt: string;
}

export interface ProposalStageDraft {
  title: string;
  result: string;
  acceptance: string;
  weeks: number;
  budgetKopecks: number;
}

export interface ProposalView {
  id: string;
  requestId: string;
  text: string;
  createdAt: string;
  stages: ProposalStageDraft[];
}


export interface ReportView {
  id: string;
  orderId: string;
  stageId: string;
  title: string;
  work: string;
  conclusion: string;
  limitations: string;
  feedback?: string | null;
  decision: string;
  createdAt: string;
  attachmentIds: string[];
}
