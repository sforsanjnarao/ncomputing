import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { Response } from "express";
import { env, isProd } from "../config/env";

export const AUTH_COOKIE = "ncomputing_token";

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

// httpOnly so client-side JavaScript (and therefore any XSS payload) can never
// read the token. In production the frontend and API sit on different domains,
// which forces SameSite=None + Secure.
export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
}
