import { z } from "zod";

export const CreatePaymentSchema = z.object({ orderId: z.string().min(1) });

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
