import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Transparent proxy from this app's /api/* to the Express API.
 *
 * The browser never talks to the API directly. This route reads the httpOnly
 * session cookie — which client-side JavaScript cannot touch — and replays it
 * as an Authorization header. Everything the browser sends is same-origin, so
 * there is no CORS negotiation and no third-party cookie to be blocked.
 */

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function proxy(request: NextRequest, path: string[]) {
  const token = cookies().get(SESSION_COOKIE)?.value;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const hasBody = !["GET", "HEAD"].includes(request.method);

  const response = await fetch(`${API_URL}/api/${path.join("/")}${request.nextUrl.search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: "no-store",
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

type Context = { params: { path: string[] } };

export const GET = (request: NextRequest, { params }: Context) => proxy(request, params.path);
export const POST = (request: NextRequest, { params }: Context) => proxy(request, params.path);
export const PATCH = (request: NextRequest, { params }: Context) => proxy(request, params.path);
export const DELETE = (request: NextRequest, { params }: Context) => proxy(request, params.path);
