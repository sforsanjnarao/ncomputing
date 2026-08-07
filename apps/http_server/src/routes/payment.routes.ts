import express, { Router } from "express";
import {
  createPayment,
  paymentWebhook,
  verifyPayment,
} from "../controllers/payment.controller";
import { protectMiddleware } from "../middleware/protected";

const router: Router = express.Router();

router.post("/create-order", protectMiddleware, createPayment);
router.post("/verify", protectMiddleware, verifyPayment);

// Razorpay's servers have no cookie — the HMAC signature *is* the
// authentication, so this route deliberately skips protectMiddleware.
router.post("/webhook", paymentWebhook);

export default router;
