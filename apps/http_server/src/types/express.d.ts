import { Role } from "@repo/db";

// Adds the authenticated principal to Express's Request so every handler and
// middleware downstream of protectMiddleware gets it type-safely.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
