import { useState } from "react";
import type { FormEvent } from "react";
import type { ProjectView } from "../types/api";
import { apiFetch, getApiErrorMessage } from "../lib/api";
import { FormField, SelectField, TextareaField } from "./FormField";
import Button from "./Button";

export default function ProjectUpdateForm({ project, onSaved }: { project: ProjectView; onSaved: () => void }) {
  const [stageId, setStageId] = useState(project.stages[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [completed, setCompleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/projects/${project.id}/updates`, { method: "POST", body: JSON.stringify({ stageId, title: title.trim(), text: text.trim(), completed }) });
      setTitle("");
      setText("");
      setCompleted(false);
      onSaved();
    } catch (error) { setError(getApiErrorMessage(error, "Не удалось опубликовать обновление")); }
    finally { setBusy(false); }
  }
  return <details className="mt-4">
    <summary className="cursor-pointer font-semibold text-green-800">Добавить обновление</summary>
    <form onSubmit={submit} className="mt-4 space-y-4">
      <SelectField id="update-stage" label="Этап" value={stageId} onChange={(event) => setStageId(event.target.value)}>
        {project.stages.map((stage) => <option key={stage.id} value={stage.id}>{stage.title}</option>)}
      </SelectField>
      <FormField id="update-title" label="Заголовок обновления" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
      <TextareaField id="update-text" label="Что изменилось" value={text} onChange={(event) => setText(event.target.value)} minLength={10} maxLength={10000} required />
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />Этап завершён</label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={busy}>{busy ? "Публикуем…" : "Опубликовать обновление"}</Button>
    </form>
  </details>;
}
