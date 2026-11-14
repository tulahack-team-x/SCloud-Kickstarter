import {
  getLabel,
  getOrderBudgetKopecks,
  ORDER_STATUS_LABELS,
} from "../../lib/dashboard";
import { formatKopecks } from "../../lib/format";
import type { OrderView } from "../../types/api";
import { Badge } from "./ui";

type OrderRowProps = {
  order: OrderView;
  organizationName?: string;
};

function OrderRow({ order, organizationName }: OrderRowProps) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
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
    </li>
  );
}

export default OrderRow;
