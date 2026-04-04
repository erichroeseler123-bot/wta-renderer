function requiredEnv(name: string) {
  const v = String(process.env[name] || "").trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function readFirstEnv(names: string[]) {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
}

export function getFareHarborCredentials() {
  const appKey = readFirstEnv([
    "FAREHARBOR_APP_KEY",
    "FH_APP_NAME",
    "FH_APP_KEY",
    "FAREHARBOR_APP",
    "FH_APP",
  ]);
  const userKey = readFirstEnv([
    "FAREHARBOR_USER_KEY",
    "FH_API_KEY",
    "FH_USER_KEY",
    "FAREHARBOR_USER",
    "FH_USER",
  ]);

  if (!appKey || !userKey) {
    throw new Error("Missing FareHarbor credentials in env.");
  }

  return { appKey, userKey };
}

export type FareHarborBookingInput = {
  company: string;
  availabilityPk: number;
  customerTypeRatePk: number;
  qty: number;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  note?: string;
  amountPaid?: number;
  voucherNumber?: string;
};

export async function createFareHarborBooking(input: FareHarborBookingInput) {
  const { appKey, userKey } = getFareHarborCredentials();

  const company = String(input.company || "").trim();
  const availabilityPk = Number(input.availabilityPk || 0);
  const customerTypeRatePk = Number(input.customerTypeRatePk || 0);
  const qty = Math.floor(Number(input.qty || 0));

  const name = String(input.contact?.name || "").trim();
  const email = String(input.contact?.email || "").trim();
  const phone = String(input.contact?.phone || "").trim();

  if (!company || !availabilityPk || !customerTypeRatePk || qty <= 0) {
    throw new Error("Missing company, availabilityPk, customerTypeRatePk, or qty.");
  }
  if (!name || !email) {
    throw new Error("Missing contact.name or contact.email.");
  }

  const fhPayload: Record<string, unknown> = {
    voucher_number: input.voucherNumber || `WTA-${Date.now()}`,
    contact: { name, email, phone },
    availability_pk: availabilityPk,
    customer_type_rates: [{ pk: customerTypeRatePk, quantity: qty }],
    note: String(input.note || "Booking via WTA (paid)"),
    is_paid: true,
  };

  const amountPaid = Number(input.amountPaid || 0);
  if (Number.isFinite(amountPaid) && amountPaid > 0) {
    fhPayload.amount_paid = Math.floor(amountPaid);
  }

  const response = await fetch(
    `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/bookings/`,
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

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = (result as { error?: string } | null)?.error || "FareHarbor booking failed";
    const err = new Error(msg);
    (err as Error & { details?: unknown; status?: number }).details = result;
    (err as Error & { details?: unknown; status?: number }).status = response.status;
    throw err;
  }

  return result;
}

export function assertBookingsEnabled() {
  const enabled = String(process.env.FH_BOOKINGS_ENABLED || "0") === "1";
  if (!enabled) {
    throw new Error("Bookings are disabled (FH_BOOKINGS_ENABLED=0). This is a safety lock.");
  }
}

export function assertInternalSecret(req: Request) {
  const secret = requiredEnv("WTA_INTERNAL_SECRET");
  const internal = req.headers.get("x-wta-internal") || "";
  if (secret !== internal) throw new Error("Unauthorized (internal only).");
}
