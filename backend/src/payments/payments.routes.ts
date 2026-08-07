import { Router } from "express";
import * as controller from "./payments.controller";
import { asyncHandler } from "../middlewares/error";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/create-order", requireAuth, asyncHandler(controller.createPaymentHandler));
router.post("/verify", requireAuth, asyncHandler(controller.verifyPaymentHandler));

// Razorpay's servers have no cookie — the HMAC signature *is* the authentication,
// so this route deliberately skips requireAuth.
router.post("/webhook", asyncHandler(controller.webhookHandler));

export default router;
