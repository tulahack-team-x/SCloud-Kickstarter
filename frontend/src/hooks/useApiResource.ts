import { useEffect, useState } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";

export function useApiResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!path) return;

    const requestPath = path;
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<T>(requestPath);

        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Не удалось загрузить данные"));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [path, requestId]);

  function reload() {
    setData(null);
    setError(null);
    setRequestId((current) => current + 1);
  }

  const loading = path !== null && data === null && error === null;

  return { data, loading, error, reload };
}
