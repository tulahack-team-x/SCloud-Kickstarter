import {
  getLabel,
  getOrderBudgetKopecks,
  ORDER_STATUS_LABELS,
  STAGE_STATUS_LABELS,
} from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type { OrderView } from "../../types/api";
import StageCard from "./StageCard";
import { Badge } from "./ui";

type OrderRowProps = {
  order: OrderView;
  organizationName?: string;
  showStages?: boolean;
};

function stageTone(status: string): "green" | "sky" | "amber" | "stone" {
  if (status === "ACCEPTED") return "green";
  if (status === "WORKING") return "sky";
  if (status === "REVIEW" || status === "REVISION") return "amber";
  return "stone";
}

function OrderRow({ order, organizationName, showStages }: OrderRowProps) {
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
              {getLabel(ORDER_STATUS_LABELS, order.status)}
            </Badge>
          </div>
        </div>
      </div>

      {showStages && order.stages.length > 0 && (
        <details open className="mt-3 rounded-xl border border-stone-100 bg-stone-50 p-3">
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
                  <Badge tone={stageTone(stage.status)}>
                    {getLabel(STAGE_STATUS_LABELS, stage.status)}
                  </Badge>
                }
              />
            ))}
          </ol>
        </details>
      )}
    </li>
  );
}

export default OrderRow;
