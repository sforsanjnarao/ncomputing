/**
 * Browser-side API client.
 *
 * The browser talks to the Express API directly (see NEXT_PUBLIC_API_URL) with
 * `credentials: "include"`, so the httpOnly session cookie the API sets travels
 * on every request. There is no Next.js proxy in front of it — CORS on the API
 * allows this origin with credentials.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, body.error ?? "Something went wrong.", body.details);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data ?? {}) }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(data ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Server-side fetch for public catalogue data used by React Server Components.
 * Talks to the API directly — no cookies involved, nothing to protect.
 */
export async function fetchFromApi<T>(path: string): Promise<T> {
  const baseUrl = process.env.API_URL ?? "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api${path}`, { cache: "no-store" });

  if (!response.ok) throw new Error(`API ${response.status} for ${path}`);

  return (await response.json()) as T;
}
