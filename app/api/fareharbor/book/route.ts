import { NextResponse } from "next/server";

// FareHarbor demo API base
const DEMO_BASE = "https://demo.fareharbor.com/api/external/v1";

// FareHarbor company shortname (REQUIRED for bookings)
const COMPANY = "bodyglove";

/**
 * POST /api/fareharbor/book
 *
 * Expected body:
 * {
 *   availabilityPk: number,
 *   contact: { name: string; email: string; phone?: string },
 *   customers: [{ customer_type_rate: number }],
 *   note?: string,
 *   voucher_number?: string
 * }
 */
export async function POST(request: Request) {
  let body: any;

  // -----------------------------
  // Parse JSON body
  // -----------------------------
  try {
    body = await request.json();
  } catch (err) {
    console.error("[BOOK ROUTE] Invalid JSON:", err);
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  console.log(
    "[BOOK ROUTE] RAW BODY RECEIVED:",
    JSON.stringify(body, null, 2)
  );

  const {
    availabilityPk,
    contact,
    customers,
    note = "FareHarbor certification test booking",
    voucher_number = "CERT-TEST-001",
  } = body ?? {};

  console.log("[BOOK ROUTE] FIELD CHECK:", {
    availabilityPk,
    hasContact: !!contact,
    contactKeys: contact ? Object.keys(contact) : null,
    customersLength: Array.isArray(customers)
      ? customers.length
      : "NOT ARRAY",
  });

  // -----------------------------
  // Minimal validation (do NOT over-restrict)
  // -----------------------------
  if (!availabilityPk) {
    return NextResponse.json(
      { error: "Missing availabilityPk" },
      { status: 400 }
    );
  }

  if (!contact?.name || !contact?.email) {
    return NextResponse.json(
      { error: "Missing contact.name or contact.email" },
      { status: 400 }
    );
  }

  if (!Array.isArray(customers) || customers.length === 0) {
    return NextResponse.json(
      { error: "Missing customers array" },
      { status: 400 }
    );
  }

  // -----------------------------
  // Build FareHarbor payload
  // -----------------------------
  const fhPayload = {
    contact,
    customers,
    note,
    voucher_number,
  };

  // ✅ CORRECT FareHarbor booking URL (this was the blocker)
  const url = `${DEMO_BASE}/companies/${COMPANY}/availabilities/${availabilityPk}/bookings/`;

  console.log("[BOOK ROUTE] FORWARDING TO:", url);
  console.log(
    "[BOOK ROUTE] PAYLOAD:",
    JSON.stringify(fhPayload, null, 2)
  );

  // -----------------------------
  // Forward to FareHarbor
  // -----------------------------
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-FareHarbor-API-App": process.env.FAREHARBOR_APP_KEY!,
        "X-FareHarbor-API-User": process.env.FAREHARBOR_USER_KEY!,
      },
      body: JSON.stringify(fhPayload),
    });

    const data = await res.json();

    console.log("[BOOK ROUTE] FAREHARBOR STATUS:", res.status);
    console.log(
      "[BOOK ROUTE] FAREHARBOR RESPONSE:",
      JSON.stringify(data, null, 2)
    );

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("[BOOK ROUTE] FETCH ERROR:", err);
    return NextResponse.json(
      { error: "Failed to reach FareHarbor" },
      { status: 500 }
    );
  }
}
