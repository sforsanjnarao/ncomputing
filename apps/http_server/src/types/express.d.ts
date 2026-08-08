import { Role } from "@repo/db";


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      };
     
      visitorId?: string;
    }
  }
}

export {};
