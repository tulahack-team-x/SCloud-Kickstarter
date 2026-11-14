import type { AccountRole } from "../types/api";

export const ACCOUNT_ROLE_LABELS: Record<AccountRole, string> = {
  CUSTOMER: "Заказчик",
  SPONSOR: "Спонсор",
  RESEARCHER: "Научная команда",
};

export function getAccountRoleLabel(role: AccountRole): string {
  return ACCOUNT_ROLE_LABELS[role];
}
