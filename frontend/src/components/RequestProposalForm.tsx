import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import { formatKopecks } from "../lib/format";
import type { ProposalView, ResearchRequestView } from "../types/api";
import Button from "./Button";
import { FormField, TextareaField } from "./FormField";

type RequestProposalFormProps = {
  request: ResearchRequestView;
  onSubmitted: () => void;
  onCancel: () => void;
};

type StageForm = {
  title: string;
  result: string;
  acceptance: string;
  weeks: string;
  budget: string;
};

function emptyStage(request: ResearchRequestView): StageForm {
  return {
    title: "",
    result: "",
    acceptance: "",
    weeks: String(request.weeks),
    budget: String(Math.round(request.budgetKopecks / 100)),
  };
}

function RequestProposalForm({
  request,
  onSubmitted,
  onCancel,
}: RequestProposalFormProps) {
  const [text, setText] = useState("");
  const [stages, setStages] = useState<StageForm[]>([emptyStage(request)]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBudget = stages.reduce(
    (total, stage) => total + (Number(stage.budget) || 0),
    0,
  );
  const totalWeeks = stages.reduce(
    (total, stage) => total + (Number(stage.weeks) || 0),
    0,
  );

  function updateStage(field: keyof StageForm, index: number, value: string) {
    setStages((current) =>
      current.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, [field]: value } : stage,
      ),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const invalidStage = stages.find(
      (stage) =>
        !Number.isInteger(Number(stage.weeks)) ||
        Number(stage.weeks) < 1 ||
        Number(stage.weeks) > 520 ||
        !Number.isFinite(Number(stage.budget)) ||
        Number(stage.budget) * 100 < 10000 ||
        Number(stage.budget) * 100 > 1000000000,
    );

    if (invalidStage) {
      setError("Проверьте сроки и бюджеты этапов");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<ProposalView>(`/requests/${request.id}/proposals`, {
        method: "POST",
        body: JSON.stringify({
          text: text.trim(),
          stages: stages.map((stage) => ({
            title: stage.title.trim(),
            result: stage.result.trim(),
            acceptance: stage.acceptance.trim(),
            weeks: Number(stage.weeks),
            budgetKopecks: Math.round(Number(stage.budget) * 100),
          })),
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
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Как команда предлагает решить задачу"
        minLength={10}
        maxLength={10000}
        required
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-stone-950">Этапы</h4>
        <Button
          type="button"
          variant="secondary"
          compact
          disabled={stages.length >= 20}
          onClick={() => setStages((current) => [...current, emptyStage(request)])}
        >
          Добавить этап
        </Button>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <fieldset
            key={index}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-stone-950">
                Этап {index + 1}
              </p>

              {stages.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setStages((current) =>
                      current.filter((_, stageIndex) => stageIndex !== index),
                    )
                  }
                  className="text-xs font-semibold text-red-600 hover:underline focus-ring"
                >
                  Удалить
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <FormField
                id={`proposal-stage-title-${request.id}-${index}`}
                label="Название этапа"
                value={stage.title}
                onChange={(event) =>
                  updateStage("title", index, event.target.value)
                }
                maxLength={200}
                required
              />

              <TextareaField
                id={`proposal-stage-result-${request.id}-${index}`}
                label="Результат этапа"
                value={stage.result}
                onChange={(event) =>
                  updateStage("result", index, event.target.value)
                }
                maxLength={5000}
                required
              />

              <TextareaField
                id={`proposal-stage-acceptance-${request.id}-${index}`}
                label="Критерий приёмки"
                value={stage.acceptance}
                onChange={(event) =>
                  updateStage("acceptance", index, event.target.value)
                }
                maxLength={5000}
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  id={`proposal-stage-budget-${request.id}-${index}`}
                  label="Бюджет этапа, ₽"
                  type="number"
                  min={100}
                  max={10000000}
                  step={100}
                  value={stage.budget}
                  onChange={(event) =>
                    updateStage("budget", index, event.target.value)
                  }
                  required
                />
                <FormField
                  id={`proposal-stage-weeks-${request.id}-${index}`}
                  label="Срок, недель"
                  type="number"
                  min={1}
                  max={520}
                  value={stage.weeks}
                  onChange={(event) =>
                    updateStage("weeks", index, event.target.value)
                  }
                  required
                />
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      <p className="text-xs text-stone-500">
        Итого: {formatKopecks(totalBudget * 100)} · {totalWeeks} недель
      </p>

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
