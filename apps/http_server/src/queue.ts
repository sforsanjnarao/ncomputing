import { Queue } from "bullmq";
import { redis } from "./redis";
import { prisma } from "@repo/db";
import { sendOrderConfirmation, sendLeadNotification } from "./email";

export const emailQueue = new Queue("email", { connection: redis });

const RETRY_OPTS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 2000 },
};

export async function queueOrderConfirmation(orderId: string) {
  if (redis.status !== "ready") {
    console.warn(`[Queue] Redis is not ready (status: ${redis.status}). Sending order confirmation directly for order ${orderId}`);
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          user: { select: { name: true, email: true } },
        },
      });
      if (order) {
        await sendOrderConfirmation(order);
      }
    } catch (err) {
      console.error("[Queue] Direct order confirmation sending failed:", err);
    }
    return;
  }
  return emailQueue.add("order-confirmation", { orderId }, RETRY_OPTS);
}

export async function queueLeadNotification(leadId: string) {
  if (redis.status !== "ready") {
    console.warn(`[Queue] Redis is not ready (status: ${redis.status}). Sending lead notification directly for lead ${leadId}`);
    try {
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (lead) {
        await sendLeadNotification(lead);
      }
    } catch (err) {
      console.error("[Queue] Direct lead notification sending failed:", err);
    }
    return;
  }
  return emailQueue.add("lead-notification", { leadId }, RETRY_OPTS);
}