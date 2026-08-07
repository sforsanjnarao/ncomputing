import express, { Router } from "express";
import {
  adminListOrders,
  adminUpdateOrderStatus,
  createOrder,
  getMyOrders,
  getOrder,
} from "../controllers/order.controller";
import { protectMiddleware, requireAdmin } from "../middleware/protected";

const router: Router = express.Router();

// Admin routes are declared before "/:id" so that a literal "/admin" path is
// never swallowed by the dynamic segment.
router.get("/admin", protectMiddleware, requireAdmin, adminListOrders);
router.patch(
  "/admin/:id/status",
  protectMiddleware,
  requireAdmin,
  adminUpdateOrderStatus,
);

router.post("/", protectMiddleware, createOrder);
router.get("/mine", protectMiddleware, getMyOrders);
// Any signed-in user may hit this; the controller decides whether this
// particular order belongs to them.
router.get("/:id", protectMiddleware, getOrder);

export default router;
