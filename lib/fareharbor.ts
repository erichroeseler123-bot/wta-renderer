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

export async function readFareHarborJson(response: Response, appKey: string, userKey: string) {
  const data = await response.json();
  const body = JSON.stringify(data);
  const credentials = [appKey, userKey].filter(Boolean).sort((a, b) => b.length - a.length);
  let safeBody = body;
  for (const key of credentials) {
    const escapedKey = JSON.stringify(key).slice(1, -1);
    safeBody = safeBody.replaceAll(escapedKey, "[REDACTED]");
  }
  return safeBody === body ? data : JSON.parse(safeBody);
}

export type FareHarborCustomFieldValueInput = {
  custom_field: number;
  value: string | number | boolean;
};

export type FareHarborCustomerInput = {
  customer_type_rate: number;
  custom_field_values?: FareHarborCustomFieldValueInput[];
};

export type FareHarborBookingInput = {
  company: string;
  itemPk?: number;
  itemName?: string;
  startAt?: string;
  endAt?: string;
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
  customers?: FareHarborCustomerInput[];
  customFieldValues?: FareHarborCustomFieldValueInput[];
  orderId?: string;
  paymentIntentId?: string;
  handoffId?: string;
  preserveUuid?: string;
  preservePk?: number;
};

export type FareHarborExternalBookingRecord = {
  pk: number;
  uuid: string;
  display_id: string;
  status: "booked" | "cancelled";
  rebooked_to: string | null;
  rebooked_from: string | null;
  external_id: string;
  voucher_number: string;
  note: string;
  confirmation_url: string;
  dashboard_url: string;
  is_eligible_for_cancellation: boolean;
  arrival: Record<string, unknown> | null;
  company: {
    name: string;
    shortname: string;
    currency: string;
  };
  affiliate_company: {
    name: string;
    shortname: string;
    currency: string;
    asn_parameter?: string;
  } | null;
  contact: {
    name: string;
    phone: string;
    email: string;
    normalized_phone: string;
    language: string;
  };
  availability: {
    pk: number;
    start_at: string;
    end_at: string;
    capacity: number;
    item: {
      pk: number;
      name: string;
    };
  };
  customers: Array<{
    pk: number;
    checkin_url: string | null;
    checkin_status: null;
    customer_type_rate: {
      pk: number;
      total: number;
      capacity: number;
      customer_prototype: {
        pk: number;
        display_name: string;
        total: number;
      };
      customer_type: {
        pk: number;
        note: string;
        singular: string;
        plural: string;
      };
    };
    custom_field_values: Array<{
      pk?: number;
      name?: string;
      value: string | number | boolean;
      display_value?: string;
      custom_field: number;
    }>;
  }>;
  custom_field_values: Array<{
    pk?: number;
    name?: string;
    value: string | number | boolean;
    display_value?: string;
    custom_field: number;
  }>;
  order: null;
  effective_cancellation_policy: {
    type: string;
    cutoff: number | null;
  };
  receipt_subtotal: number;
  receipt_taxes: number;
  receipt_total: number;
  amount_paid: number;
  invoice_price: number;
  validation?: {
    validated_via: string;
    is_bookable: boolean;
    validated_at: string;
    live_bookings_enabled: boolean;
  };
};

function buildDefaultCoastalCustomFields(
  company: string,
  qty: number,
  contactName: string,
  customers?: FareHarborCustomerInput[],
  customFieldValues?: FareHarborCustomFieldValueInput[],
) {
  const rateCustomers: FareHarborCustomerInput[] =
    customers && customers.length > 0
      ? customers
      : Array.from({ length: qty }, (_, idx) => ({
          customer_type_rate: 0,
          custom_field_values:
            company.toLowerCase() === "coastalhelicopters"
              ? [
                  {
                    custom_field: 1232849,
                    value: idx === 0 ? contactName : `${contactName} Guest ${idx + 1}`,
                  },
                  {
                    custom_field: 1255444,
                    value: "175",
                  },
                ]
              : [],
        }));

  const bookingFields: FareHarborCustomFieldValueInput[] =
    customFieldValues && customFieldValues.length > 0
      ? customFieldValues
      : company.toLowerCase() === "coastalhelicopters"
        ? [
            { custom_field: 1964515, value: "Already in Juneau / Hotel Stay" },
            { custom_field: 1964516, value: "Remaining in Juneau / Next Day Departure" },
            { custom_field: 1684301, value: true },
          ]
        : [];

  return { rateCustomers, bookingFields };
}

export function buildFareHarborExternalBookingPayload(input: FareHarborBookingInput) {
  const company = String(input.company || "").trim();
  const availabilityPk = Number(input.availabilityPk || 0);
  const customerTypeRatePk = Number(input.customerTypeRatePk || 0);
  const qty = Math.floor(Number(input.qty || 0));

  const name = String(input.contact?.name || "").trim();
  const email = String(input.contact?.email || "").trim();
  const phone = String(input.contact?.phone || "").trim() || "+1-907-555-0142";

  if (!company || !availabilityPk || !customerTypeRatePk || qty <= 0) {
    throw new Error("Missing company, availabilityPk, customerTypeRatePk, or qty.");
  }
  if (!name || !email) {
    throw new Error("Missing contact.name or contact.email.");
  }

  const { rateCustomers, bookingFields } = buildDefaultCoastalCustomFields(
    company,
    qty,
    name,
    input.customers,
    input.customFieldValues,
  );

  const normalizedCustomers = rateCustomers.map((c) => ({
    customer_type_rate: c.customer_type_rate || customerTypeRatePk,
    ...(c.custom_field_values && c.custom_field_values.length > 0
      ? { custom_field_values: c.custom_field_values }
      : {}),
  }));

  const fhPayload: Record<string, unknown> = {
    voucher_number: input.voucherNumber || `WTA-${Date.now()}`,
    contact: { name, email, phone },
    customers: normalizedCustomers,
    ...(bookingFields.length > 0 ? { custom_field_values: bookingFields } : {}),
    note: String(input.note || "Booking via WTA (paid)"),
  };

  return {
    company,
    availabilityPk,
    customerTypeRatePk,
    qty,
    name,
    email,
    phone,
    normalizedCustomers,
    bookingFields,
    fhPayload,
  };
}

export async function createFareHarborBooking(input: FareHarborBookingInput) {
  const { appKey, userKey } = getFareHarborCredentials();
  const { company, availabilityPk, fhPayload } = buildFareHarborExternalBookingPayload(input);

  const response = await fetch(
    `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/availabilities/${encodeURIComponent(String(availabilityPk))}/bookings/`,
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

  const result = await readFareHarborJson(response, appKey, userKey).catch(() => null);

  if (!response.ok) {
    const msg = (result as { error?: string } | null)?.error || "FareHarbor booking failed";
    const err = new Error(msg);
    (err as Error & { details?: unknown; status?: number }).details = result;
    (err as Error & { details?: unknown; status?: number }).status = response.status;
    throw err;
  }

  return result;
}

export type FareHarborBookingValidationResult = {
  is_bookable: boolean;
  verificationStatus: "checkout referral verified in preview";
  company: string;
  availabilityPk: number;
  customerTypeRatePk: number;
  qty: number;
  voucher_number: string;
  note: string;
  handoffId: string | null;
  orderId: string | null;
  receipt_subtotal: number;
  receipt_taxes: number;
  receipt_total: number;
  invoice_price: number;
  validated_via: string;
  validated_at: string;
  live_bookings_enabled: boolean;
};

export async function validateFareHarborBooking(
  input: FareHarborBookingInput,
): Promise<{
  validation: FareHarborBookingValidationResult;
  booking: null;
}> {
  const { appKey, userKey } = getFareHarborCredentials();
  const {
    company,
    availabilityPk,
    customerTypeRatePk,
    qty,
    fhPayload,
  } = buildFareHarborExternalBookingPayload(input);

  const validateUrl = `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/availabilities/${encodeURIComponent(String(availabilityPk))}/bookings/validate/`;

  const response = await fetch(validateUrl, {
    method: "POST",
    headers: {
      "X-FareHarbor-API-App": appKey,
      "X-FareHarbor-API-User": userKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fhPayload),
  });

  const validation = (await readFareHarborJson(response, appKey, userKey).catch(() => null)) as
    | {
        is_bookable?: boolean;
        error?: string | null;
        invoice_price?: number;
        receipt_subtotal?: number;
        receipt_taxes?: number;
        receipt_total?: number;
      }
    | null;

  if (!response.ok || !validation?.is_bookable) {
    const msg =
      validation?.error ||
      `FareHarbor booking validation failed (HTTP ${response.status})`;
    const err = new Error(msg);
    (err as Error & { details?: unknown; status?: number }).details = validation;
    (err as Error & { details?: unknown; status?: number }).status = response.status;
    throw err;
  }

  const subtotal = Number(validation.receipt_subtotal ?? input.amountPaid ?? 0);
  const taxes = Number(validation.receipt_taxes ?? 0);
  const total = Number(validation.receipt_total ?? subtotal + taxes);
  const invoicePrice = Number(validation.invoice_price ?? Math.round(subtotal * 0.8));

  return {
    validation: {
      is_bookable: true,
      verificationStatus: "checkout referral verified in preview",
      company,
      availabilityPk,
      customerTypeRatePk,
      qty,
      voucher_number: String(fhPayload.voucher_number),
      note: String(fhPayload.note),
      handoffId: input.handoffId || null,
      orderId: input.orderId || null,
      receipt_subtotal: subtotal,
      receipt_taxes: taxes,
      receipt_total: total,
      invoice_price: invoicePrice,
      validated_via: validateUrl,
      validated_at: new Date().toISOString(),
      live_bookings_enabled: String(process.env.FH_BOOKINGS_ENABLED || "0") === "1",
    },
    booking: null,
  };
}

export async function getAuthorizedFareHarborBooking(params: {
  company: string;
  bookingUuid: string;
  environment?: "live" | "demo";
}): Promise<{
  source: "fareharbor_external_api" | "fareharbor_demo_external_api";
  booking: FareHarborExternalBookingRecord | Record<string, unknown>;
}> {
  const { appKey, userKey } = getFareHarborCredentials();
  const company = String(params.company || "").trim();
  const bookingUuid = String(params.bookingUuid || "").trim();
  const isDemo = params.environment === "demo";

  if (!company || !bookingUuid) {
    throw new Error("Missing company or bookingUuid.");
  }

  if (bookingUuid.toLowerCase().startsWith("fhv1-")) {
    const err = new Error(
      `Simulated booking reference ${bookingUuid} is forbidden in confirmed-sale reporting.`,
    );
    (err as Error & { status?: number }).status = 422;
    throw err;
  }

  const fhHost = isDemo ? "https://demo.fareharbor.com" : "https://fareharbor.com";
  const fhUrl = `${fhHost}/api/external/v1/companies/${encodeURIComponent(company)}/bookings/${encodeURIComponent(bookingUuid)}/`;
  const response = await fetch(fhUrl, {
    method: "GET",
    headers: {
      "X-FareHarbor-API-App": appKey,
      "X-FareHarbor-API-User": userKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.ok) {
    const data = (await readFareHarborJson(response, appKey, userKey).catch(() => null)) as
      | { booking?: Record<string, unknown> }
      | null;
    if (data?.booking) {
      return {
        source: isDemo ? "fareharbor_demo_external_api" : "fareharbor_external_api",
        booking: data.booking,
      };
    }
  }

  const err = new Error(
    `FareHarbor booking ${bookingUuid} not found on ${fhHost} for company ${company} (HTTP ${response.status}).`,
  );
  (err as Error & { status?: number }).status = response.status === 404 ? 404 : response.status || 404;
  throw err;
}

export function extractDccHandoffIdFromFareHarborRecord(
  booking: Record<string, unknown> | null | undefined,
): string | null {
  if (!booking || typeof booking !== "object") return null;
  const candidates = [
    booking["note"],
    booking["voucher_number"],
    booking["external_id"],
    booking["affiliate_company"] &&
    typeof booking["affiliate_company"] === "object"
      ? (booking["affiliate_company"] as Record<string, unknown>)["asn_parameter"]
      : undefined,
  ];
  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const match = raw.match(/\b(hndf_[a-zA-Z0-9_-]+)\b/);
    if (match?.[1]) return match[1];
  }
  return null;
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

