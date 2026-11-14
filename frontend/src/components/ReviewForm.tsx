import { Star } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { ReviewView } from "../types/api";
import Button from "./Button";
import { TextareaField } from "./FormField";

type ReviewFormProps = {
  orderId: string;
  onSubmitted: () => void;
  onCancel: () => void;
};

function ReviewForm({ orderId, onSubmitted, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiFetch<ReviewView>(`/orders/${orderId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, text: text.trim() }),
      });

      onSubmitted();
    } catch (err) {
      setError(getApiErrorMessage(err, "Не удалось опубликовать отзыв"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <p className="mb-2 block text-sm font-semibold text-stone-900">
          Оценка
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} из 5`}
              onClick={() => setRating(value)}
              className="rounded-md p-1 text-amber-500 focus-ring"
            >
              <Star
                className={
                  value <= rating
                    ? "size-6 fill-current"
                    : "size-6 text-stone-300"
                }
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <TextareaField
        id="review-text"
        label="Ваш опыт"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Что прошло хорошо, а что можно улучшить"
        minLength={10}
        maxLength={5000}
        required
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Публикуем..." : "Опубликовать отзыв"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;
