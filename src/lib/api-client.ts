/** Error thrown by feature services; mirrors the API's `{ error: { code, message, field } }`. */
export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, {
      ...init,
      headers:
        init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json", ...init.headers }
          : init?.headers,
    });
  } catch {
    throw new ApiClientError(0, "network", "You appear to be offline. Check your connection.");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error;
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
    throw new ApiClientError(
      res.status,
      err?.code ?? "unknown",
      err?.message ?? "Something went wrong. Please try again.",
      err?.field,
    );
  }
  return data as T;
}

export const json = (body: unknown) => JSON.stringify(body);
