import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { ProposalView, ResearchRequestView } from "../types/api";
import Button from "./Button";
import { FormField, TextareaField } from "./FormField";

type RequestProposalFormProps = {
  request: ResearchRequestView;
  onSubmitted: () => void;
  onCancel: () => void;
};

function RequestProposalForm({
  request,
  onSubmitted,
  onCancel,
}: RequestProposalFormProps) {
  const [form, setForm] = useState({
    text: "",
    stageTitle: "",
    stageResult: "",
    stageAcceptance: "",
    stageWeeks: String(request.weeks),
    stageBudget: String(Math.round(request.budgetKopecks / 100)),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const weeks = Number(form.stageWeeks);
    const budgetKopecks = Math.round(Number(form.stageBudget) * 100);

    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 520) {
      setError("Срок этапа должен быть от 1 до 520 недель");
      return;
    }

    if (
      !Number.isFinite(budgetKopecks) ||
      budgetKopecks < 10000 ||
      budgetKopecks > 1000000000
    ) {
      setError("Бюджет этапа должен быть от 100 до 10 000 000 ₽");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<ProposalView>(`/requests/${request.id}/proposals`, {
        method: "POST",
        body: JSON.stringify({
          text: form.text.trim(),
          stages: [
            {
              title: form.stageTitle.trim(),
              result: form.stageResult.trim(),
              acceptance: form.stageAcceptance.trim(),
              weeks,
              budgetKopecks,
            },
          ],
          expectedVersion: request.version,
        }),
      });

      onSubmitted();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось отправить предложение"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-xl border border-stone-100 bg-stone-50 p-4"
    >
      <h3 className="font-bold text-stone-950">Предложение команды</h3>

      <TextareaField
        id={`proposal-text-${request.id}`}
        label="Методика и условия"
        value={form.text}
        onChange={(event) => updateField("text", event.target.value)}
        placeholder="Как команда предлагает решить задачу"
        minLength={10}
        maxLength={10000}
        required
      />

      <FormField
        id={`proposal-stage-title-${request.id}`}
        label="Этап"
        value={form.stageTitle}
        onChange={(event) => updateField("stageTitle", event.target.value)}
        placeholder="Название этапа"
        maxLength={200}
        required
      />

      <TextareaField
        id={`proposal-stage-result-${request.id}`}
        label="Результат этапа"
        value={form.stageResult}
        onChange={(event) => updateField("stageResult", event.target.value)}
        placeholder="Что будет получено"
        maxLength={5000}
        required
      />

      <TextareaField
        id={`proposal-stage-acceptance-${request.id}`}
        label="Критерий приёмки"
        value={form.stageAcceptance}
        onChange={(event) => updateField("stageAcceptance", event.target.value)}
        placeholder="Как заказчик проверит результат"
        maxLength={5000}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id={`proposal-stage-budget-${request.id}`}
          label="Бюджет этапа, ₽"
          type="number"
          min={100}
          max={10000000}
          step={100}
          value={form.stageBudget}
          onChange={(event) => updateField("stageBudget", event.target.value)}
          required
        />
        <FormField
          id={`proposal-stage-weeks-${request.id}`}
          label="Срок, недель"
          type="number"
          min={1}
          max={520}
          value={form.stageWeeks}
          onChange={(event) => updateField("stageWeeks", event.target.value)}
          required
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" compact disabled={submitting}>
          {submitting ? "Отправляем..." : "Отправить предложение"}
        </Button>
        <Button type="button" variant="secondary" compact onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export default RequestProposalForm;
