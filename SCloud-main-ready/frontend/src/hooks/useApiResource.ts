import { useEffect, useState } from "react";
import { apiFetch, getApiErrorMessage } from "../lib/api";

type Resource<T> = {
  path: string | null;
  revision: number;
  data: T | null;
  error: string | null;
};

export function useApiResource<T>(path: string | null) {
  const [revision, setRevision] = useState(0);
  const [resource, setResource] = useState<Resource<T>>({
    path: null, revision: -1, data: null, error: null,
  });

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    apiFetch<T>(path).then(
      (data) => {
        if (!cancelled) setResource({ path, revision, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) {
          setResource({ path, revision, data: null,
            error: getApiErrorMessage(error, "Не удалось загрузить данные") });
        }
      },
    );
    return () => { cancelled = true; };
  }, [path, revision]);

  const current = path !== null && resource.path === path && resource.revision === revision;
  return {
    data: current ? resource.data : null,
    error: current ? resource.error : null,
    loading: path !== null && (!current || resource.data === null && resource.error === null),
    reload: () => setRevision((value) => value + 1),
  };
}
