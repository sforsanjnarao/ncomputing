/**
 * Browser-side API client.
 *
 * Every call goes to this app's own `/api/*` routes, which proxy through to the
 * Express API (see src/app/api/[...path]/route.ts). Two reasons:
 *   1. the session token stays in an httpOnly cookie the browser cannot read;
 *   2. requests are same-origin, so there is no CORS or third-party-cookie
 *      problem when the frontend and API are deployed to different hosts.
 */

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
  const response = await fetch(`/api${path}`, {
    ...init,
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
};

/**
 * Server-side fetch for public catalogue data used by React Server Components.
 * Talks to the Express API directly — no cookies involved, nothing to protect.
 */
export async function fetchFromApi<T>(path: string): Promise<T> {
  const baseUrl = process.env.API_URL ?? "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api${path}`, { cache: "no-store" });

  if (!response.ok) throw new Error(`API ${response.status} for ${path}`);

  return (await response.json()) as T;
}
