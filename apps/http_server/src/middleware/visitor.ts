import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const VISITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
  maxAge: ONE_YEAR_MS,
};

export function visitorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let visitorId = req.cookies?.visitorId as string | undefined;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    res.cookie("visitorId", visitorId, VISITOR_COOKIE_OPTIONS);
  }

  req.visitorId = visitorId;
  next();
}
