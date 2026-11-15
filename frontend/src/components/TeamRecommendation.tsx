import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import type { OrganizationView } from "../types/api";
import Button from "./Button";
import { TextareaField } from "./FormField";

export default function TeamRecommendation() {
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ organization: OrganizationView | null } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(await apiFetch("/recommendations", { method: "POST",
        body: JSON.stringify({ description: description.trim(), mandatoryRequirements: [], preferences: [] }) }));
    } catch (error) {
      setError(getApiErrorMessage(error, "Не удалось подобрать команду. Воспользуйтесь каталогом."));
    } finally { setBusy(false); }
  }

  return <details className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
    <summary className="cursor-pointer font-bold text-green-800">Подобрать команду по задаче</summary>
    <form onSubmit={submit} className="mt-4 space-y-4">
      <TextareaField id="recommendation-task" label="Задача исследования" value={description}
        onChange={(event) => setDescription(event.target.value)} minLength={10} maxLength={10000} required />
      <p className="text-xs text-stone-500">Описание будет передано сервису подбора. Рекомендация основана на профилях команд; сроки и стоимость согласуются отдельно.</p>
      <Button type="submit" disabled={busy}>{busy ? "Подбираем команду…" : "Подобрать команду"}</Button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {result && (result.organization ? <Link className="focus-ring block font-bold text-green-800 underline"
        to={`/organizations/${result.organization.id}`}>{result.organization.name} →</Link>
        : <p className="text-sm text-stone-600">Подходящая команда не найдена. Попробуйте уточнить задачу.</p>)}
    </form>
  </details>;
}
