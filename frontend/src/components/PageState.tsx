import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import Spinner from "./Spinner";

export function BackLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition-colors hover:text-green-800"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}

export function PageLoading() {
  return (
    <div className="flex justify-center py-16">
      <Spinner className="size-6 text-green-800" />
    </div>
  );
}

export function PageError({
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
