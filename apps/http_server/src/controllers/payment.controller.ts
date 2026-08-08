import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma, OrderStatus, PaymentStatus, Role } from "@repo/db";
import { CreatePaymentSchema, VerifyPaymentSchema } from "../zod/payment.zod";
import { queueOrderConfirmation } from "../queue";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const razorpay =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
    : null;


async function markPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order) return null;

  if (order.paymentStatus === PaymentStatus.PAID) {
    return prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, name: true, email: true, organization: true },
        },
      },
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PaymentStatus.PAID,
      // Paid orders move straight into the fulfilment queue.
      status: OrderStatus.PROCESSING,
      razorpayPaymentId,
    },
    include: {
      items: { include: { product: true } },
      user: {
        select: { id: true, name: true, email: true, organization: true },
      },
    },
  });

  queueOrderConfirmation(updated.id).catch((err) =>
    console.error("order confirmation enqueue failed", err),
  );

  return updated;
}


export const createPayment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const parsed = CreatePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request.",
      details: parsed.error.flatten().fieldErrors,
    });
  }
  if (!razorpay)
    return res
      .status(503)
      .json({ error: "Payments are not configured on this server yet." });

  try {
    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
    });
    if (!order)
      return res.status(404).json({ error: "That order does not exist." });
    if (req.user!.role !== Role.ADMIN && order.userId !== userId) {
      return res.status(403).json({ error: "forbidden" });
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      return res.status(400).json({ error: "This order is already paid." });
    }

  
    const amountInPaise = Math.round(order.orderAmount * 100);

    
    if (order.razorpayOrderId) {
      return res.status(200).json({
        keyId: RAZORPAY_KEY_ID,
        razorpayOrderId: order.razorpayOrderId,
        amountInPaise,
        orderNumber: order.orderNumber,
      });
    }

    const gatewayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: order.orderCurrency,
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: gatewayOrder.id },
    });

    return res.status(200).json({
      keyId: RAZORPAY_KEY_ID,
      razorpayOrderId: gatewayOrder.id,
      amountInPaise,
      orderNumber: order.orderNumber,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

// Verifies the signature Razorpay hands to the browser on success. Without this
// check, a user could simply call the success endpoint by hand.
export const verifyPayment = async (req: Request, res: Response) => {
  const parsed = VerifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request.",
      details: parsed.error.flatten().fieldErrors,
    });
  }
  if (!RAZORPAY_KEY_SECRET)
    return res
      .status(503)
      .json({ error: "Payments are not configured on this server yet." });

  try {
    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(
        `${parsed.data.razorpay_order_id}|${parsed.data.razorpay_payment_id}`,
      )
      .digest("hex");

    if (expected !== parsed.data.razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Payment signature could not be verified." });
    }

    const order = await markPaid(
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
    );
    if (!order)
      return res.status(404).json({ error: "Unknown payment reference." });

    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};


export const paymentWebhook = async (req: Request, res: Response) => {
  if (!RAZORPAY_WEBHOOK_SECRET)
    return res.status(503).json({ error: "Webhook secret is not configured." });

  const rawBody =
    (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
  const signature = req.headers["x-razorpay-signature"] as string | undefined;

  try {
    const expected = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    if (!signature || expected !== signature) {
      return res.status(403).json({ error: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string } } };
    };

    const payment = event.payload?.payment?.entity;
    if (event.event === "payment.captured" && payment) {
      await markPaid(payment.order_id, payment.id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};
