import { useState } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";

export type AttachmentView = { id: string; name: string; size: number };

export default function AttachmentPicker({ orderId, onChange, onBusy }: {
  orderId: string;
  onChange: (ids: string[]) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [items, setItems] = useState<AttachmentView[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length || busy) return;
    if (items.length + files.length > 10 || Array.from(files).some((file) => file.size > 10 * 1024 * 1024)) {
      setError("Можно приложить до 10 файлов, каждый не больше 10 МБ.");
      return;
    }
    setBusy(true);
    onBusy(true);
    setError(null);
    const uploaded = [...items];
    try {
      for (const file of Array.from(files)) {
        const data = new FormData();
        data.set("ownerType", "ORDER");
        data.set("ownerId", orderId);
        data.set("file", file);
        uploaded.push(await apiFetch<AttachmentView>("/attachments", { method: "POST", body: data }));
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Не удалось загрузить файл"));
    } finally {
      setItems(uploaded);
      onChange(uploaded.map((item) => item.id));
      setBusy(false);
      onBusy(false);
    }
  }

  return <div className="space-y-2">
    <label className="block text-sm font-bold" htmlFor="report-files">Файлы результата</label>
    <input id="report-files" type="file" multiple disabled={busy}
      className="focus-ring block w-full text-sm" onChange={(event) => { void upload(event.currentTarget.files); event.currentTarget.value = ""; }} />
    <p className="text-xs text-stone-500">До 10 файлов по 10 МБ. {busy ? "Загрузка…" : ""}</p>
    {items.map((item) => <p key={item.id} className="text-sm text-green-800">{item.name}</p>)}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </div>;
}
