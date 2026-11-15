import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Button from "../Button";
import Spinner from "../Spinner";
import { formatKopecks } from "../../lib/format";

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
};

export function StatCard({ label, value, sub, icon: Icon }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-stone-500">{label}</span>
        {Icon && <Icon className="size-5 text-stone-400" aria-hidden="true" />}
      </div>
      <div className="mt-3 text-2xl font-black text-stone-950">{value}</div>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}

type SectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap justify-between gap-3">
        <h2 className="text-lg font-bold text-stone-950">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className="text-stone-500">
          {formatKopecks(value)} / {formatKopecks(max)}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-green-600 transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

type BadgeTone = "green" | "amber" | "stone" | "sky";

const BADGE_TONES: Record<BadgeTone, string> = {
  green: "bg-green-50 text-green-800",
  amber: "bg-amber-50 text-amber-700",
  stone: "bg-stone-100 text-stone-600",
  sky: "bg-sky-50 text-sky-700",
};

export function Badge({
  children,
  tone = "stone",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
        BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export function DashboardLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="size-6 text-green-800" />
    </div>
  );
}

export function DashboardError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <p className="text-sm text-red-700">{message}</p>
      <div className="mt-4">
        <Button onClick={onRetry}>Повторить</Button>
      </div>
    </div>
  );
}
