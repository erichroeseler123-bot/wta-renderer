import { NextResponse } from "next/server";

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export async function POST(req: Request) {
  try {
    // ---- INTERNAL-ONLY GUARD ----
    const internal = req.headers.get("x-wta-internal");
    const secret = String(process.env.WTA_INTERNAL_SECRET || "");
    if (!secret || internal !== secret) {
      return jsonError("Unauthorized (internal only).", 403);
    }

    // ---- SAFETY SWITCH ----
    const enabled = String(process.env.FH_BOOKINGS_ENABLED || "0") === "1";
    if (!enabled) {
      return jsonError("Bookings are disabled (FH_BOOKINGS_ENABLED=0). Safety lock.", 409);
    }

    const body = await req.json();

    // Required fields (from webhook snapshot)
    const company = String(body?.company || "");
    const availability_pk = Number(body?.availability_pk || 0);
    const customer_type_rate_pk = Number(body?.customer_type_rate_pk || 0);
    const qty = Number(body?.qty || 0);

    const contact = body?.contact || {};
    const name = String(contact?.name || "");
    const email = String(contact?.email || "");
    const phone = String(contact?.phone || "");

    const note = String(body?.note || "");
    const amount_paid = Number(body?.amount_paid || 0); // cents, optional (try it)

    if (!company || !availability_pk || !customer_type_rate_pk || qty <= 0) {
      return jsonError("Missing company, availability_pk, customer_type_rate_pk, or qty.", 400);
    }
    if (!name || !email) return jsonError("Missing contact.name or contact.email.", 400);

    const fhPayload: any = {
      voucher_number: `WTA-${Date.now()}`,
      // If you are MoR, FH should consider this booking paid/collected by affiliate.
      // Some FH setups accept amount_paid; some accept is_paid. We'll send both.
      is_paid: true,
      contact: { name, email, phone },
      availability_pk,
      customer_type_rates: [{ pk: customer_type_rate_pk, quantity: qty }],
      note: note || "Booking via WTA (Stripe paid)",
    };

    // Try to pass amount_paid if provided (line total cents)
    if (Number.isFinite(amount_paid) && amount_paid > 0) {
      fhPayload.amount_paid = Math.floor(amount_paid);
    }

    const appKey = String(process.env.FAREHARBOR_APP_KEY ?? process.env.FH_APP_NAME ?? "");
    const userKey = String(process.env.FAREHARBOR_USER_KEY ?? process.env.FH_API_KEY ?? "");
    if (!appKey || !userKey) {
      return jsonError("Missing FareHarbor API credentials in env.", 500);
    }

    const response = await fetch(
      `https://fareharbor.com/api/external/v1/companies/${company}/bookings/`,
      {
        method: "POST",
        headers: {
          "X-FareHarbor-API-App": appKey,
          "X-FareHarbor-API-User": userKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fhPayload),
      },
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return jsonError("FareHarbor booking failed", 502, { details: result });
    }

    return NextResponse.json({ success: true, booking: result });
  } catch (e: any) {
    return jsonError("Booking route crashed", 500, { details: String(e?.message || e) });
  }
}
