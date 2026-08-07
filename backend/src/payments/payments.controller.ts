import { Request, Response } from "express";
import { z } from "zod";
import * as service from "./payments.service";

const createSchema = z.object({ orderId: z.string().min(1) });

export async function createPaymentHandler(req: Request, res: Response) {
  const { orderId } = createSchema.parse(req.body);
  res.json(await service.createPaymentOrder(orderId, req.user!.id, req.user!.role));
}

// Razorpay's checkout widget uses snake_case; map it at the boundary so the
// rest of the codebase stays camelCase.
const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function verifyPaymentHandler(req: Request, res: Response) {
  const body = verifySchema.parse(req.body);
  const order = await service.verifyCheckoutSignature({
    razorpayOrderId: body.razorpay_order_id,
    razorpayPaymentId: body.razorpay_payment_id,
    razorpaySignature: body.razorpay_signature,
  });
  res.json({ order });
}

export async function webhookHandler(req: Request, res: Response) {
  const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
  const signature = req.headers["x-razorpay-signature"] as string | undefined;
  res.json(await service.handleWebhook(rawBody, signature));
}
