import { useApiResource } from "../hooks/useApiResource";
import type { PageSlice } from "../types/api";
import type { AttachmentView } from "./AttachmentPicker";

export default function ReportAttachments({ orderId, ids }: { orderId: string; ids: string[] }) {
  const resource = useApiResource<PageSlice<AttachmentView>>(ids.length
    ? `/attachments?ownerType=ORDER&ownerId=${encodeURIComponent(orderId)}&limit=100` : null);
  if (!ids.length) return null;
  if (resource.error) return <p role="alert" className="text-sm text-red-700">{resource.error}</p>;
  return <div className="space-y-2">
    <h3 className="text-sm font-bold">Файлы результата</h3>
    {resource.loading ? <p className="text-sm">Загрузка файлов…</p> : ids.map((id) =>
      <a key={id} href={`/api/attachments/${encodeURIComponent(id)}/content`} download
        className="focus-ring block text-sm font-semibold text-green-800 underline">
        {resource.data?.items.find((item) => item.id === id)?.name ?? "Скачать файл"}
      </a>)}
  </div>;
}
