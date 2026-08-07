import { Router } from "express";
import * as controller from "./orders.controller";
import { asyncHandler } from "../middlewares/error";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

// Admin routes are declared before "/:id" so that a literal "/admin" path is
// never swallowed by the dynamic segment.
router.get("/admin", requireAdmin, asyncHandler(controller.adminListOrdersHandler));
router.patch("/admin/:id/status", requireAdmin, asyncHandler(controller.adminUpdateStatusHandler));

router.post("/", requireAuth, asyncHandler(controller.createOrderHandler));
router.get("/mine", requireAuth, asyncHandler(controller.myOrdersHandler));
// Any signed-in user may hit this; the service decides whether this particular
// order belongs to them.
router.get("/:id", requireAuth, asyncHandler(controller.getOrderHandler));

export default router;
