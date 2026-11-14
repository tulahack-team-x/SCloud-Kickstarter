import { getOrderBudgetKopecks } from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type { ReactNode } from "react";
import type { OrderView, StageStatus } from "../../types/api";
import StageCard from "./StageCard";
import { Badge } from "./ui";

type OrderRowProps = {
  order: OrderView;
  organizationName?: string;
  showStages?: boolean;
  action?: ReactNode;
  stageAction?: (stage: OrderView["stages"][number]) => ReactNode;
};

const STAGE_STATUS_LABELS: Record<StageStatus, string> = {
  PLANNED: "Запланирован",
  WORKING: "В работе",
  REVIEW: "На проверке",
  ACCEPTED: "Принят",
  REVISION: "На доработке",
};

function OrderRow({
  order,
  organizationName,
  showStages,
  action,
  stageAction,
}: OrderRowProps) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-950">{order.title}</p>
          <p className="mt-1 text-xs text-stone-500">
            {organizationName ?? "Организация"} · {order.stages.length} этапов
          </p>
        </div>

        <div className="text-right">
          <p className="font-bold text-stone-950">
            {formatKopecks(getOrderBudgetKopecks(order))}
          </p>
          <div className="mt-1">
            <Badge tone={order.status === "ACTIVE" ? "green" : "sky"}>
              {order.status === "COMPLETED" ? "Завершён" : "В работе"}
            </Badge>
          </div>
        </div>
      </div>

      {showStages && order.stages.length > 0 && (
        <details
          open
          className="mt-3 rounded-xl border border-stone-100 bg-stone-50 p-3"
        >
          <summary className="cursor-pointer text-xs font-semibold text-green-800">
            Этапы заказа
          </summary>
          <ol className="mt-3 space-y-2">
            {order.stages.map((stage, index) => (
              <StageCard
                key={stage.id}
                index={index}
                title={stage.title}
                result={stage.result}
                acceptance={stage.acceptance}
                weeks={stage.weeks}
                budgetKopecks={stage.budgetKopecks}
                status={
                  <Badge
                    tone={
                      stage.status === "ACCEPTED" ||
                      stage.status === "WORKING"
                        ? "green"
                        : stage.status === "PLANNED"
                          ? "stone"
                          : "amber"
                    }
                  >
                    {STAGE_STATUS_LABELS[stage.status]}
                  </Badge>
                }
                action={stageAction?.(stage)}
              />
            ))}
          </ol>
        </details>
      )}

      {action && <div className="mt-3">{action}</div>}
    </li>
  );
}

export default OrderRow;
