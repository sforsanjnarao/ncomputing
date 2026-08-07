import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "@repo/db";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export const protectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const decode = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: decode.userId, role: decode.role };

    next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};

// Rejects requests from users who do not hold one of the given roles. This is
// the real security boundary — the frontend guard only hides the UI.
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };

export const requireAdmin = requireRole("ADMIN");
