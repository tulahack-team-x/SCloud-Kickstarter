import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { ApiError, apiFetch, getApiErrorMessage } from "../lib/api";
import type { ContributionView } from "../types/api";
import Button from "./Button";
import { FormField } from "./FormField";

type ContributionFormProps = {
  projectId: string;
  onContributed: () => void;
};

const PRESETS = [500, 1000, 5000];

function ContributionForm({ projectId, onContributed }: ContributionFormProps) {
  const [amount, setAmount] = useState("500");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<{ amount: number; key: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amountRubles = Number(amount);
    const amountKopecks = Math.round(amountRubles * 100);

    if (
      !Number.isFinite(amountRubles) ||
      amountKopecks < 10000 ||
      amountKopecks > 1000000000
    ) {
      setError("Сумма должна быть от 100 до 10 000 000 ₽");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (!attempt.current || attempt.current.amount !== amountKopecks) {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      attempt.current = { amount: amountKopecks,
        key: Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("") };
    }

    try {
      const contribution = await apiFetch<ContributionView>(
        `/projects/${projectId}/contributions`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": attempt.current.key,
          },
          body: JSON.stringify({ amountKopecks }),
        },
      );

      if (contribution.status === "PENDING") {
        try {
          await apiFetch<ContributionView>(
            `/demo/contributions/${contribution.id}/confirmation`,
            { method: "POST" },
          );
        } catch (err) {
          if (!(err instanceof ApiError && err.status === 404)) {
            throw err;
          }
          throw new Error("Взнос создан и ожидает подтверждения. Платёжный сервис не подключён.");
        }
      }

      onContributed();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось поддержать проект"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-stone-100 pt-4">
      <p className="text-xs text-stone-500">Тестовый взнос: реальные деньги не списываются.</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(String(preset))}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-50 focus-ring"
          >
            {preset} ₽
          </button>
        ))}
      </div>

      <FormField
        id="contribution-amount"
        label="Сумма, ₽"
        type="number"
        min={100}
        max={10000000}
        step={100}
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        required
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full justify-center"
        compact
      >
        {submitting ? "Отправляем..." : "Поддержать"}
      </Button>
    </form>
  );
}

export default ContributionForm;
