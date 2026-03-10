import { saveOrder, type OrderSnapshot } from "@/lib/orders";

type SendResult = {
  sent: boolean;
  reason?: string;
  error?: string;
  provider?: string;
  providerId?: string;
};

function esc(v: unknown) {
  const s = String(v ?? "");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmtMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "usd").toUpperCase(),
  }).format((Number(cents || 0) || 0) / 100);
}

function fmtWhen(v?: string) {
  if (!v) return "TBD";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" });
}

function subject(order: OrderSnapshot) {
  return `Your Welcome To Alaska Tours Booking Confirmation (${order.order_id})`;
}

function makeHtml(order: OrderSnapshot) {
  const total = fmtMoney(order.totalCents, order.currency);
  const lines = order.items
    .map((line) => {
      const when = fmtWhen(line.startAt);
      return `<tr>
<td style="padding:8px;border-bottom:1px solid #e2e8f0;">${esc(line.title || "Tour")}</td>
<td style="padding:8px;border-bottom:1px solid #e2e8f0;">${esc(line.company)}</td>
<td style="padding:8px;border-bottom:1px solid #e2e8f0;">${esc(when)}</td>
<td style="padding:8px;border-bottom:1px solid #e2e8f0;">${esc(line.qty)}</td>
</tr>`;
    })
    .join("");

  const confirmations = (order.bookingResults || [])
    .map((result) => {
      if (!result || typeof result !== "object") return null;
      const r = result as Record<string, unknown>;
      const bookingObj =
        r.booking && typeof r.booking === "object"
          ? (r.booking as Record<string, unknown>)
          : {};
      const id = String(
        bookingObj.display_id || bookingObj.uuid || bookingObj.pk || "",
      ).trim();
      return id ? `<li>${esc(id)}</li>` : null;
    })
    .filter((x): x is string => Boolean(x))
    .join("");

  return `<!doctype html>
<html>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:20px;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
    <h1 style="margin:0 0 12px 0;">Booking Confirmed</h1>
    <p style="margin:0 0 16px 0;">Thanks for booking with Welcome To Alaska Tours.</p>
    <p style="margin:0 0 6px 0;"><strong>Order ID:</strong> ${esc(order.order_id)}</p>
    <p style="margin:0 0 6px 0;"><strong>Total Paid:</strong> ${esc(total)}</p>
    <p style="margin:0 0 16px 0;"><strong>Traveler:</strong> ${esc(order.contact.name)} (${esc(order.contact.email)})</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#f1f5f9;">
          <th style="text-align:left;padding:8px;">Tour</th>
          <th style="text-align:left;padding:8px;">Operator</th>
          <th style="text-align:left;padding:8px;">Departure</th>
          <th style="text-align:left;padding:8px;">Qty</th>
        </tr>
      </thead>
      <tbody>${lines}</tbody>
    </table>

    ${
      confirmations
        ? `<p style="margin:0 0 6px 0;"><strong>Confirmation Numbers</strong></p><ul style="margin-top:6px;">${confirmations}</ul>`
        : ""
    }

    <p style="margin:16px 0 4px 0;">Operator instructions and meeting details are included in your tour confirmation flow.</p>
    <p style="margin:0;color:#475569;">Need help? Reply to this email or contact support.</p>
  </div>
</body>
</html>`;
}

function makeText(order: OrderSnapshot) {
  const lines = order.items
    .map((line) => `- ${line.title || "Tour"} | ${line.company} | ${fmtWhen(line.startAt)} | qty ${line.qty}`)
    .join("\n");

  const confirmations = (order.bookingResults || [])
    .map((result) => {
      if (!result || typeof result !== "object") return "";
      const r = result as Record<string, unknown>;
      const bookingObj =
        r.booking && typeof r.booking === "object"
          ? (r.booking as Record<string, unknown>)
          : {};
      return String(bookingObj.display_id || bookingObj.uuid || bookingObj.pk || "").trim();
    })
    .filter(Boolean)
    .join(", ");

  return [
    "Booking Confirmed",
    `Order: ${order.order_id}`,
    `Total Paid: ${fmtMoney(order.totalCents, order.currency)}`,
    `Traveler: ${order.contact.name} <${order.contact.email}>`,
    "",
    "Tours:",
    lines,
    "",
    confirmations ? `Confirmation Numbers: ${confirmations}` : "",
    "Thank you for booking with Welcome To Alaska Tours.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendViaResend(order: OrderSnapshot): Promise<SendResult> {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY not configured" };

  const from = String(
    process.env.BOOKING_EMAIL_FROM || process.env.RESEND_FROM_EMAIL || "",
  ).trim();
  if (!from) {
    return {
      sent: false,
      reason: "BOOKING_EMAIL_FROM (or RESEND_FROM_EMAIL) not configured",
    };
  }

  const payload = {
    from,
    to: [order.contact.email],
    subject: subject(order),
    html: makeHtml(order),
    text: makeText(order),
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    const msg = typeof json?.message === "string" ? json.message : `Resend error ${res.status}`;
    return { sent: false, error: msg };
  }

  const providerId = typeof json?.id === "string" ? json.id : undefined;
  return { sent: true, provider: "resend", providerId };
}

export async function maybeSendBookingConfirmationEmail(order: OrderSnapshot) {
  if (order.status !== "booked") return { sent: false, reason: "order_not_booked" };
  if (order.confirmationEmailSentAt) return { sent: false, reason: "already_sent" };

  try {
    const result = await sendViaResend(order);
    if (result.sent) {
      const updated = await saveOrder({
        ...order,
        confirmationEmailSentAt: new Date().toISOString(),
        confirmationEmailProvider: result.provider || "resend",
        confirmationEmailId: result.providerId,
        confirmationEmailError: undefined,
      });
      return { ...result, order: updated };
    }

    if (result.error || result.reason) {
      const updated = await saveOrder({
        ...order,
        confirmationEmailError: result.error || result.reason,
      });
      return { ...result, order: updated };
    }

    return result;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const updated = await saveOrder({
      ...order,
      confirmationEmailError: msg,
    });
    return { sent: false, error: msg, order: updated };
  }
}
