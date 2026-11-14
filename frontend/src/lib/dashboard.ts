import type { OrderView } from "../types/api";

export const ORDER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "В работе",
  COMPLETED: "Завершён",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Опубликован",
};

export const CONTRIBUTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждён",
};

export const STAGE_STATUS_LABELS: Record<string, string> = {
  PLANNED: "Запланирован",
  WORKING: "В работе",
  REVIEW: "На проверке",
  ACCEPTED: "Принят",
  REVISION: "На доработке",
};

export function getOrderBudgetKopecks(order: OrderView): number {
  return order.stages.reduce(
    (total, stage) => total + stage.budgetKopecks,
    0,
  );
}

export function getOrderAcceptedBudgetKopecks(order: OrderView): number {
  return order.stages
    .filter((stage) => stage.status === "ACCEPTED")
    .reduce((total, stage) => total + stage.budgetKopecks, 0);
}

export function getOrderAcceptedStages(order: OrderView): number {
  return order.stages.filter((stage) => stage.status === "ACCEPTED").length;
}

export function getLabel(
  labels: Record<string, string>,
  value: string,
): string {
  return labels[value] ?? value;
}
