export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type CsrfToken = {
  token: string;
  headerName: string;
};

function resolvePath(path: string): string {
  if (path.startsWith("/api")) return path;
  return `/api${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseError(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function getCsrf(): Promise<CsrfToken> {
  const response = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Не удалось получить CSRF-токен (${response.status})`,
      await parseError(response),
    );
  }

  return (await response.json()) as CsrfToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (options.body instanceof URLSearchParams) {
    headers.set(
      "Content-Type",
      "application/x-www-form-urlencoded;charset=UTF-8",
    );
  } else if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = await getCsrf();
    headers.set(csrf.headerName, csrf.token);
  }

  const response = await fetch(resolvePath(path), {
    credentials: "same-origin",
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Запрос не выполнен (${response.status})`,
      await parseError(response),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}


export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError) {
    const payload = error.payload;

    if (
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
    ) {
      return payload.message;
    }

    return error.message;
  }

  return error instanceof Error ? error.message : fallback;
}
