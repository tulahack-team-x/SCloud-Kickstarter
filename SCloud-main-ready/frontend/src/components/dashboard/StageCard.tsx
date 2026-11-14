import type { ReactNode } from "react";
import { formatKopecks } from "../../lib/format";

type StageCardProps = {
  index: number;
  title: string;
  result: string;
  acceptance: string;
  weeks: number;
  budgetKopecks: number;
  status?: ReactNode;
  action?: ReactNode;
};

function StageCard({
  index,
  title,
  result,
  acceptance,
  weeks,
  budgetKopecks,
  status,
  action,
}: StageCardProps) {
  return (
    <li className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-100 text-xs font-bold text-green-800">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="font-semibold text-stone-950">{title}</p>
          {status}
        </div>

        <p className="mt-1 text-sm leading-6 text-stone-600">{result}</p>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          Приёмка: {acceptance} · {weeks} нед. ·{" "}
          {formatKopecks(budgetKopecks)}
        </p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </li>
  );
}

export default StageCard;
