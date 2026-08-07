import crypto from "crypto";
import Razorpay from "razorpay";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { env, razorpayConfigured } from "../config/env";
import { ApiError, badRequest, forbidden, notFound } from "../utils/errors";
import { sendOrderConfirmation } from "../utils/email";

const razorpay = razorpayConfigured
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID!, key_secret: env.RAZORPAY_KEY_SECRET! })
  : null;

function requireGateway() {
  if (!razorpay) {
    throw new ApiError(503, "Payments are not configured on this server yet.");
  }
  return razorpay;
}

/**
 * Creates (or reuses) the Razorpay order that the checkout widget will open.
 * The amount is read from our own database row, so the browser cannot influence
 * what is actually charged.
 */
export async function createPaymentOrder(orderId: string, userId: string, role: Role) {
  const gateway = requireGateway();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw notFound("That order does not exist.");
  if (role !== Role.ADMIN && order.userId !== userId) throw forbidden();
  if (order.paymentStatus === PaymentStatus.PAID) throw badRequest("This order is already paid.");

  // Reuse the existing gateway order if the user reloaded the checkout page.
  if (order.razorpayOrderId) {
    return {
      keyId: env.RAZORPAY_KEY_ID!,
      razorpayOrderId: order.razorpayOrderId,
      amountInPaise: order.totalInPaise,
      orderNumber: order.orderNumber,
    };
  }

  const gatewayOrder = await gateway.orders.create({
    amount: order.totalInPaise,
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: gatewayOrder.id },
  });

  return {
    keyId: env.RAZORPAY_KEY_ID!,
    razorpayOrderId: gatewayOrder.id,
    amountInPaise: order.totalInPaise,
    orderNumber: order.orderNumber,
  };
}

/**
 * Marks an order paid exactly once and emails the receipt.
 * Both the browser callback and the webhook funnel through here, so a duplicate
 * call is a no-op rather than a second email.
 */
async function markPaid(razorpayOrderId: string, razorpayPaymentId: string) {
  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order) throw notFound("Unknown payment reference.");
  if (order.paymentStatus === PaymentStatus.PAID) {
    return prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: PaymentStatus.PAID,
      // Paid orders move straight into the fulfilment queue.
      status: OrderStatus.PROCESSING,
      razorpayPaymentId,
    },
    include: { items: true },
  });

  sendOrderConfirmation(updated).catch((error) =>
    console.error("[email] order confirmation failed", error)
  );

  return updated;
}

/**
 * Verifies the signature Razorpay hands to the browser on success.
 * Without this check, a user could simply call our success endpoint by hand.
 */
export async function verifyCheckoutSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  requireGateway();

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");

  if (expected !== input.razorpaySignature) {
    throw badRequest("Payment signature could not be verified.");
  }

  return markPaid(input.razorpayOrderId, input.razorpayPaymentId);
}

/**
 * Server-to-server confirmation. The browser callback can be lost (tab closed,
 * network dropped) — the webhook is what makes the flow reliable.
 */
export async function handleWebhook(rawBody: string, signature: string | undefined) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new ApiError(503, "Webhook secret is not configured.");
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!signature || expected !== signature) throw forbidden("Invalid webhook signature.");

  const event = JSON.parse(rawBody) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string } } };
  };

  const payment = event.payload?.payment?.entity;
  if (event.event === "payment.captured" && payment) {
    await markPaid(payment.order_id, payment.id);
  }

  return { received: true };
}
