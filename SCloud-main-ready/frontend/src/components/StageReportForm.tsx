import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { OrderStageView, ReportView } from "../types/api";
import Button from "./Button";
import { FormField, TextareaField } from "./FormField";
import AttachmentPicker from "./AttachmentPicker";

type StageReportFormProps = {
  orderId: string;
  stage: OrderStageView;
  onSubmitted: () => void;
  onCancel: () => void;
};

function StageReportForm({
  orderId,
  stage,
  onSubmitted,
  onCancel,
}: StageReportFormProps) {
  const [form, setForm] = useState({
    title: "",
    work: "",
    conclusion: "",
    limitations: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<ReportView>(
        `/orders/${orderId}/stages/${stage.id}/reports`,
        {
          method: "POST",
          body: JSON.stringify({
            title: form.title.trim(),
            work: form.work.trim(),
            conclusion: form.conclusion.trim(),
            limitations: form.limitations.trim(),
            attachmentIds,
            expectedVersion: stage.version,
          }),
        },
      );

      onSubmitted();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось сдать этап"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        id="report-title"
        label="Название отчёта"
        value={form.title}
        onChange={(event) => updateField("title", event.target.value)}
        maxLength={200}
        required
      />

      <TextareaField
        id="report-work"
        label="Что сделали"
        value={form.work}
        onChange={(event) => updateField("work", event.target.value)}
        minLength={10}
        maxLength={10000}
        required
      />

      <TextareaField
        id="report-conclusion"
        label="Что получили"
        value={form.conclusion}
        onChange={(event) => updateField("conclusion", event.target.value)}
        minLength={10}
        maxLength={10000}
        required
      />

      <TextareaField
        id="report-limitations"
        label="Ограничения и следующий шаг"
        value={form.limitations}
        onChange={(event) => updateField("limitations", event.target.value)}
        maxLength={5000}
        required
      />

      <AttachmentPicker orderId={orderId} onChange={setAttachmentIds} onBusy={setUploading} />
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? "Отправляем..." : "Сдать этап на проверку"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export default StageReportForm;
