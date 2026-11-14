import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { ResearchRequestView } from "../types/api";
import Button from "./Button";
import { FormField, TextareaField } from "./FormField";

type ResearchRequestFormProps = {
  organizationId: string;
  onCreated: (request: ResearchRequestView) => void;
  onCancel: () => void;
};

function ResearchRequestForm({
  organizationId,
  onCreated,
  onCancel,
}: ResearchRequestFormProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "100000",
    weeks: "8",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const budgetKopecks = Math.round(Number(form.budget) * 100);
    const weeks = Number(form.weeks);

    if (
      !Number.isFinite(budgetKopecks) ||
      budgetKopecks < 10000 ||
      budgetKopecks > 1000000000
    ) {
      setError("Бюджет должен быть от 100 до 10 000 000 ₽");
      return;
    }

    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 520) {
      setError("Срок должен быть от 1 до 520 недель");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const request = await apiFetch<ResearchRequestView>("/requests", {
        method: "POST",
        body: JSON.stringify({
          organizationId,
          title: form.title.trim(),
          description: form.description.trim(),
          budgetKopecks,
          weeks,
        }),
      });

      onCreated(request);
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось отправить запрос"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
        <FormField
          id="request-title"
          label="Название задачи"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Что нужно исследовать?"
          minLength={5}
          maxLength={200}
          required
        />

        <TextareaField
          id="request-description"
          label="Описание"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Опишите проблему, контекст и ожидаемый результат"
          minLength={20}
          maxLength={10000}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="request-budget"
            label="Бюджет, ₽"
            type="number"
            min={100}
            max={10000000}
            step={100}
            value={form.budget}
            onChange={(event) => updateField("budget", event.target.value)}
            required
          />
          <FormField
            id="request-weeks"
            label="Срок, недель"
            type="number"
            min={1}
            max={520}
            value={form.weeks}
            onChange={(event) => updateField("weeks", event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Отправляем..." : "Отправить запрос"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export default ResearchRequestForm;
