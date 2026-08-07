import { z } from "zod";

export const CreatePaymentSchema = z.object({ orderId: z.string().min(1) });

// Razorpay's checkout widget speaks snake_case; map it at the boundary so the
// rest of the codebase stays camelCase.
export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
