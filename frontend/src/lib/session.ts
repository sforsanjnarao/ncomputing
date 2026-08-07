import { jwtVerify } from "jose";
import type { Role } from "./types";

export const SESSION_COOKIE = "nc_session";

export type SessionPayload = {
  sub: string;
  email: string;
  role: Role;
};

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? "");

/**
 * Verifies the token the API issued. Uses `jose` rather than `jsonwebtoken`
 * because Next.js middleware runs on the Edge runtime, which has no Node crypto.
 *
 * Returns null instead of throwing: an expired cookie should quietly log
 * somebody out, not crash the page they were reading.
 */
export async function readSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};
