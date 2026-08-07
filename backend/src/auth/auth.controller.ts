import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "./auth.service";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/token";
import { unauthorized } from "../utils/errors";

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

function issueSession(res: Response, user: authService.PublicUser) {
  const token = signToken({ sub: user.id, email: user.email, role: user.role });

  // The cookie covers direct/same-site API use (curl, Postman, local testing).
  setAuthCookie(res, token);

  // The token is also returned in the body because in production the Next.js
  // app proxies every API call: it stores this token in its *own* httpOnly
  // cookie and replays it as a Bearer header. That keeps the session readable
  // by Next.js middleware without needing the frontend and API to share a
  // parent domain.
  return res.json({ user, token });
}

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await authService.register(input);
  return issueSession(res, user);
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await authService.login(email, password);
  return issueSession(res, user);
}

export async function meHandler(req: Request, res: Response) {
  // requireAuth guarantees req.user, but the row could have been deleted since
  // the token was issued.
  const user = await authService.getById(req.user!.id);
  if (!user) throw unauthorized("Your account no longer exists.");
  return res.json({ user });
}

export async function logoutHandler(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}
