import { Lead, Order, OrderItem, Product, User } from "@repo/db";
import { Resend } from "resend";
import { formatInr } from "@repo/types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM =
  process.env.MAIL_FROM || "NComputing India <onboarding@resend.dev>";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    // Keeps local development and CI runnable without a Resend key.
    console.log(
      `[email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}`,
    );
    return;
  }
  await resend.emails.send({ from: MAIL_FROM, to, subject, html });
}

type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
  user: User;
};

export async function sendOrderConfirmation(order: OrderWithDetails) {
  const rows = order.items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0">
          <strong>${item.product.name}</strong>
          <div style="color:#64748b;font-size:13px">Qty ${item.quantity} &times; ${formatInr(
            item.product.amount,
          )}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right">${formatInr(
          item.product.amount * item.quantity,
        )}</td>
      </tr>`,
    )
    .join("");

  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h1 style="font-size:20px">Thanks for your order, ${order.user.name.split(" ")[0]}.</h1>
    <p style="color:#475569">
      We have received payment for order <strong>${order.orderNumber}</strong>.
      Our team will confirm dispatch within two working days.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0">${rows}</table>
    <table style="width:100%;font-size:14px">
      <tr><td style="padding-top:8px"><strong>Total paid</strong></td>
          <td style="text-align:right;padding-top:8px"><strong>${formatInr(
            order.orderAmount,
          )}</strong></td></tr>
    </table>
    <p style="color:#64748b;font-size:13px;margin-top:32px">
      NComputing India &middot; Questions? Just reply to this email.
    </p>
  </div>`;

  await send(order.user.email, `Order confirmed — ${order.orderNumber}`, html);
}

export async function sendLeadNotification(lead: Lead) {
  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;color:#0f172a">
    <h2 style="font-size:18px">Thanks, ${lead.name.split(" ")[0]} — we have your request.</h2>
    <p style="color:#475569">
      A member of our team will call you on ${lead.phone} within one working day
      to discuss ${lead.seats ? `your ${lead.seats}-seat requirement` : "your requirement"}.
    </p>
    <p style="color:#64748b;font-size:13px">Reference: ${lead.type} &middot; ${lead.id}</p>
  </div>`;

  await send(
    lead.email,
    "We've received your request — NComputing India",
    html,
  );
}
