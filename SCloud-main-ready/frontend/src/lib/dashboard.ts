import type { OrderView, RequestStatus } from "../types/api";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  SENT: "Новый",
  PROPOSED: "Предложение отправлено",
  ACCEPTED: "Принят",
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
