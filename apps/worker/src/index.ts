import "dotenv/config";
import { Worker, Job } from "bullmq";
import { prisma } from "@repo/db";
import { redis } from "./redis";
import { sendOrderConfirmation, sendLeadNotification } from "./email";

async function processJob(job: Job) {
  if (job.name === "order-confirmation") {
    const order = await prisma.order.findUnique({
      where: { id: job.data.orderId },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    });
    if (!order) return; 
    await sendOrderConfirmation(order);
    return;
  }

  if (job.name === "lead-notification") {
    const lead = await prisma.lead.findUnique({
      where: { id: job.data.leadId },
    });
    if (!lead) return;
    await sendLeadNotification(lead);
    return;
  }

  console.error(`unknown job type: ${job.name}`);
}

const worker = new Worker("email", processJob, { connection: redis });

worker.on("completed", (job) => {
  console.log(`[worker] ${job.name} ${job.id} sent`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] ${job?.name} ${job?.id} failed`, err);
});

console.log("Worker started, listening on the email queue");
