import { Router } from "express";
import * as controller from "./leads.controller";
import { asyncHandler } from "../middlewares/error";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

// Public: a visitor requesting a demo has no account yet — that is the point.
router.post("/", asyncHandler(controller.createLeadHandler));

router.get("/admin", requireAdmin, asyncHandler(controller.adminListLeadsHandler));
router.patch("/admin/:id", requireAdmin, asyncHandler(controller.adminUpdateLeadHandler));

export default router;
