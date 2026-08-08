import { Queue } from "bullmq";
import { redis } from "./redis";


export const emailQueue = new Queue("email", { connection: redis });

const RETRY_OPTS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 2000 },
};

export function queueOrderConfirmation(orderId: string) {
  return emailQueue.add("order-confirmation", { orderId }, RETRY_OPTS);
}

export function queueLeadNotification(leadId: string) {
  return emailQueue.add("lead-notification", { leadId }, RETRY_OPTS);
}
