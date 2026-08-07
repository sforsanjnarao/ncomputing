import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

/**
 * Shared handler for login and register.
 *
 * These two cannot use the generic proxy because they are the only endpoints
 * that produce a token — this is where it gets moved out of the response body
 * and into an httpOnly cookie on *this* origin, so that Next.js middleware can
 * read it and client-side JavaScript cannot.
 */
export async function authenticateAgainstApi(request: NextRequest, endpoint: "login" | "register") {
  const upstream = await fetch(`${API_URL}/api/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });

  const body = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(body, { status: upstream.status });
  }

  // The token is deliberately stripped from what reaches the browser.
  const { token, ...safeBody } = body as { token?: string; user?: unknown };
  const response = NextResponse.json(safeBody);

  if (token) {
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  }

  return response;
}
