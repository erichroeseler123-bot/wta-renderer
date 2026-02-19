import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FH_BASE = "https://fareharbor.com/api/external/v1";

function jsonError(message: string, status = 400, extra?: any) {
  return NextResponse.json({ success: false, message, ...(extra ?? {}) }, { status });
}

type BookReq = {
  company: string; // shortname, e.g. "beyondak"
  availabilityPk: number;
  contact: { name: string; email: string; phone?: string };
  lines: Array<{ customerTypeRatePk: number; qty: number }>;
  note?: string;
  externalId?: string;
};

export async function POST(req: Request) {
  try {
    const FH_APP_KEY =
      process.env.FAREHARBOR_APP_KEY ||
      process.env.FH_APP_KEY ||
      process.env.FH_APP_NAME;

    const FH_USER_KEY =
      process.env.FAREHARBOR_USER_KEY ||
      process.env.FH_USER_KEY ||
      process.env.FH_API_KEY;

    if (!FH_APP_KEY || !FH_USER_KEY) {
      return jsonError(
        "FareHarbor keys not configured on server (need FAREHARBOR_APP_KEY + FAREHARBOR_USER_KEY).",
        500
      );
    }

    const body = (await req.json()) as Partial<BookReq>;

    // ---- accept old payload shape too (your current vercel curl) ----
    const company = String(body.company ?? "").trim();
    const availabilityPk = Number(
      (body as any).availabilityPk ?? (body as any).availability_pk ?? 0
    );

    // old shape: customer_type_rate_pk + qty (single line)
    const oldRatePk = Number((body as any).customer_type_rate_pk ?? (body as any).customerTypeRatePk ?? 0);
    const oldQty = Number((body as any).qty ?? 0);

    const contact = (body as any).contact ?? (body as any).customer ?? null;

    let lines = Array.isArray((body as any).lines) ? (body as any).lines : null;
    if (!lines && Number.isFinite(oldRatePk) && oldRatePk > 0 && Number.isFinite(oldQty) && oldQty > 0) {
      lines = [{ customerTypeRatePk: oldRatePk, qty: oldQty }];
    }

    if (!company) return jsonError("Missing company");
    if (!Number.isFinite(availabilityPk) || availabilityPk <= 0) return jsonError("Invalid availabilityPk");
    if (!contact?.name || !contact?.email) return jsonError("Missing contact.name or contact.email");
    if (!Array.isArray(lines) || !lines.length) return jsonError("Missing lines[]");

    // ---- Build FH customers[] payload ----
    const customers: Array<{ customer_type_rate: number }> = [];
    for (const ln of lines) {
      const pk = Number(ln.customerTypeRatePk ?? (ln as any).customer_type_rate_pk);
      const qty = Number(ln.qty);
      if (!Number.isFinite(pk) || pk <= 0) return jsonError("Invalid customerTypeRatePk in lines[]");
      if (!Number.isFinite(qty) || qty <= 0 || qty > 50) return jsonError("Invalid qty in lines[]");
      for (let i = 0; i < qty; i++) customers.push({ customer_type_rate: pk });
    }

    const fhPayload: any = {
      contact: {
        name: String(contact.name),
        email: String(contact.email),
        phone: contact.phone ? String(contact.phone) : "",
      },
      customers,
    };

    if ((body as any).note) fhPayload.note = String((body as any).note);
    if ((body as any).externalId) fhPayload.external_id = String((body as any).externalId);

    // Correct endpoint for booking from a specific availability:
    const url = `${FH_BASE}/companies/${encodeURIComponent(
      company
    )}/availabilities/${encodeURIComponent(String(availabilityPk))}/bookings/`;

    const fhRes = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-FareHarbor-API-App": FH_APP_KEY,
        "X-FareHarbor-API-User": FH_USER_KEY,
      },
      body: JSON.stringify(fhPayload),
    });

    const text = await fhRes.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!fhRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "FareHarbor booking failed",
          status: fhRes.status,
          fareharbor: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, booking: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
