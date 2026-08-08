import { Lead, Order, OrderItem, Product } from "@repo/db";
import { Resend } from "resend";
import { formatInr } from "@repo/types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM =
  process.env.MAIL_FROM || "NComputing India <onboarding@resend.dev>";

const LEAD_NOTIFY_TO = process.env.LEAD_NOTIFY_TO;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function send(to: string, subject: string, html: string) {
  if (!resend) {

    console.log(
      `[email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}`,
    );
    return;
  }
  await resend.emails.send({ from: MAIL_FROM, to, subject, html });
}

type OrderWithDetails = Order & {
  items: (OrderItem & { product: Product })[];
  user: { name: string; email: string };
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


function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leadAcknowledgement(lead: Lead) {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;color:#0f172a">
    <h2 style="font-size:18px">Thanks, ${esc(lead.name.split(" ")[0] ?? lead.name)} — we have your request.</h2>
    <p style="color:#475569">
      A member of our team will call you on ${esc(lead.phone)} within one working day
      to discuss ${lead.seats ? `your ${lead.seats}-seat requirement` : "your requirement"}.
    </p>
    <p style="color:#64748b;font-size:13px">Reference: ${lead.type} &middot; ${lead.id}</p>
  </div>`;
}

function leadInternalAlert(lead: Lead) {
  const row = (label: string, value: string | null) =>
    value
      ? `<tr>
          <td style="padding:6px 16px 6px 0;color:#64748b;vertical-align:top;white-space:nowrap">${label}</td>
          <td style="padding:6px 0;color:#0f172a">${esc(value)}</td>
        </tr>`
      : "";

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#0f172a">
    <h2 style="font-size:18px;margin-bottom:4px">New ${lead.type} lead</h2>
    <p style="color:#64748b;font-size:13px;margin-top:0">
      ${lead.createdAt.toISOString()} &middot; ${lead.id}
    </p>
    <table style="border-collapse:collapse;font-size:14px;margin:16px 0">
      ${row("Name", lead.name)}
      ${row("Email", lead.email)}
      ${row("Phone", lead.phone)}
      ${row("Organization", lead.organization)}
      ${row("Seats", lead.seats ? String(lead.seats) : null)}
      ${row("Product", lead.productSlug)}
      ${row("Message", lead.message)}
    </table>
    <p style="color:#64748b;font-size:13px">
      Reply directly to <a href="mailto:${encodeURI(lead.email)}">${esc(lead.email)}</a>,
      or open the lead in the admin dashboard.
    </p>
  </div>`;
}

export async function sendLeadNotification(lead: Lead) {

  const results = await Promise.allSettled([
    send(
      lead.email,
      "We've received your request — NComputing India",
      leadAcknowledgement(lead),
    ),
    LEAD_NOTIFY_TO
      ? send(
          LEAD_NOTIFY_TO,
          `New ${lead.type} lead — ${lead.name}`,
          leadInternalAlert(lead),
        )
      : Promise.resolve(),
  ]);

  const failures = results
    .filter((r): r is PromiseRejectedResult => r.status === "rejected")
    .map((r) => String(r.reason));
  if (failures.length) throw new Error(failures.join("; "));
}
