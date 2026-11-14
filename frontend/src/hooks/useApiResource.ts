import { useEffect, useState } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";

export function useApiResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<T>(path);

        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "Не удалось загрузить данные кабинета"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [path, requestId]);

  function reload() {
    setLoading(true);
    setError(null);
    setRequestId((current) => current + 1);
  }

  return { data, loading, error, reload };
}
