import express, { Router } from "express";
import {
  adminListLeads,
  adminUpdateLead,
  createLead,
} from "../controllers/lead.controller";
import { protectMiddleware, requireAdmin } from "../middleware/protected";

const router: Router = express.Router();

router.post("/", createLead);

router.get("/admin", protectMiddleware, requireAdmin, adminListLeads);
router.patch("/admin/:id", protectMiddleware, requireAdmin, adminUpdateLead);

export default router;
