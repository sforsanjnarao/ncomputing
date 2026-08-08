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

router.get("/admin", protectMiddleware, requireAdmin, adminListOrders);
router.patch(
  "/admin/:id/status",
  protectMiddleware,
  requireAdmin,
  adminUpdateOrderStatus,
);

router.post("/", protectMiddleware, createOrder);
router.get("/mine", protectMiddleware, getMyOrders);

router.get("/:id", protectMiddleware, getOrder);

export default router;
