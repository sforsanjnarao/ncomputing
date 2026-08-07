import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { AUTH_COOKIE, verifyToken } from "../utils/token";
import { forbidden, unauthorized } from "../utils/errors";

/**
 * Reads the JWT if one is present and attaches the principal to the request.
 * Never rejects — it is mounted globally so that handlers which behave
 * differently for signed-in users can check `req.user` themselves.
 */
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  // Cookie first (that is how the browser talks to us). The Authorization
  // header is accepted too, which keeps curl/Postman testing painless.
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = req.cookies?.[AUTH_COOKIE] ?? bearer;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // Expired or tampered token: treat as anonymous rather than erroring, so
      // public pages keep working with a stale cookie in the jar.
    }
  }

  next();
}

/** Rejects anonymous requests. Mount on anything that needs an identity. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(unauthorized());
  next();
}

/**
 * Rejects requests from users who do not hold one of the given roles.
 * This is the real security boundary — the Next.js middleware that hides the
 * /admin UI is only a convenience, since anyone can call the API directly.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

export const requireAdmin = requireRole(Role.ADMIN);
