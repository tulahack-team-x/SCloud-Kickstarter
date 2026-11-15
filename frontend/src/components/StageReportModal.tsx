import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import { useApiResource } from "../hooks/useApiResource";
import { formatDate } from "../lib/format";
import type {
  OrderStageView,
  PageSlice,
  ReportView,
} from "../types/api";
import Button from "./Button";
import { TextareaField } from "./FormField";
import Spinner from "./Spinner";

type StageReportModalProps = {
  orderId: string;
  stage: OrderStageView;
  canDecide: boolean;
  onDecided: () => void;
  onCancel: () => void;
};

function StageReportModal({
  orderId,
  stage,
  canDecide,
  onDecided,
  onCancel,
}: StageReportModalProps) {
  const reportsResource = useApiResource<PageSlice<ReportView>>(
    `/orders/${orderId}/stages/${stage.id}/reports?limit=100`,
  );
  const [mode, setMode] = useState<"view" | "revision">("view");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reports = reportsResource.data?.items ?? [];
  const report =
    reports.find((item) => item.id === stage.currentReportId) ??
    reports.at(-1);

  async function decide(accepted: boolean) {
    if (!report) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(
        `/orders/${orderId}/stages/${stage.id}/decision`,
        {
          method: "POST",
          body: JSON.stringify({
            reportId: report.id,
            accepted,
            comment: accepted ? undefined : comment.trim(),
            expectedVersion: stage.version,
          }),
        },
      );

      onDecided();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось сохранить решение"));
    } finally {
      setSubmitting(false);
    }
  }

  if (reportsResource.loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-5 text-green-800" />
      </div>
    );
  }

  if (reportsResource.error) {
    return <p className="text-sm text-red-600">{reportsResource.error}</p>;
  }

  if (!report) {
    return <p className="text-sm text-stone-500">Отчёт пока не сдан.</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-bold text-stone-950">{report.title}</p>
        <p className="mt-1 text-xs text-stone-500">
          {formatDate(report.createdAt)}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-bold text-stone-950">Что сделали</h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-600">
          {report.work}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-bold text-stone-950">Результат</h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-600">
          {report.conclusion}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-bold text-stone-950">Ограничения</h3>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-stone-600">
          {report.limitations}
        </p>
      </div>

      <div className="rounded-xl bg-stone-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
          Критерий приёмки
        </p>
        <p className="mt-1 text-sm leading-6 text-stone-700">
          {stage.acceptance}
        </p>
      </div>

      {canDecide && stage.status === "REVIEW" && (
        <div className="space-y-3 border-t border-stone-100 pt-4">
          {mode === "revision" ? (
            <>
              <TextareaField
                id="revision-comment"
                label="Что нужно уточнить?"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={10}
                maxLength={5000}
                required
              />

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex flex-wrap gap-2">
                <Button
                  compact
                  disabled={submitting || comment.trim().length < 10}
                  onClick={() => void decide(false)}
                >
                  Отправить на доработку
                </Button>
                <Button
                  compact
                  variant="secondary"
                  onClick={() => setMode("view")}
                >
                  Отмена
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button compact onClick={() => void decide(true)} disabled={submitting}>
                Принять этап
              </Button>
              <Button
                compact
                variant="secondary"
                onClick={() => setMode("revision")}
              >
                Вернуть на доработку
              </Button>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          )}
        </div>
      )}

      {!canDecide && (
        <div className="flex justify-end">
          <Button compact variant="secondary" onClick={onCancel}>
            Закрыть
          </Button>
        </div>
      )}
    </div>
  );
}

export default StageReportModal;
