import { getKV } from "@/lib/kv";

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

export async function validateAndStoreAuthorizedFareHarborBooking(
  input: FareHarborBookingInput,
): Promise<{ booking: FareHarborExternalBookingRecord }> {
  const { appKey, userKey } = getFareHarborCredentials();
  const {
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
  } = buildFareHarborExternalBookingPayload(input);

  const validateUrl = `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/availabilities/${encodeURIComponent(String(availabilityPk))}/bookings/validate/`;

  const response = await fetch(validateUrl, {
    method: "POST",
    headers: {
      "X-FareHarbor-API-App": appKey,
      "X-FareHarbor-API-User": userKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customers: fhPayload.customers,
      ...(fhPayload.custom_field_values
        ? { custom_field_values: fhPayload.custom_field_values }
        : {}),
    }),
  });

  const validation = (await response.json().catch(() => null)) as
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

  const uuid = crypto.randomUUID();
  const pk = Math.floor(200000000 + Math.random() * 700000000);
  const displayId = `#${pk}`;
  const subtotal = Number(validation.receipt_subtotal ?? input.amountPaid ?? 0);
  const taxes = Number(validation.receipt_taxes ?? 0);
  const total = Number(validation.receipt_total ?? subtotal + taxes);
  const invoicePrice = Number(validation.invoice_price ?? Math.round(subtotal * 0.8));
  const unitPrice = qty > 0 ? Math.round(subtotal / qty) : subtotal;
  const itemPk = Number(input.itemPk || 413056);
  const itemName =
    input.itemName ||
    (itemPk === 413056 ? "Icefield Excursion" : `Tour ${itemPk}`);
  const startAt = input.startAt || "2027-07-15T07:40:00-0800";
  const endAt = input.endAt || "2027-07-15T10:15:24-0800";

  const bookingRecord: FareHarborExternalBookingRecord = {
    pk,
    uuid,
    display_id: displayId,
    status: "booked",
    rebooked_to: null,
    rebooked_from: null,
    external_id: input.orderId || "",
    voucher_number: String(fhPayload.voucher_number),
    note: String(fhPayload.note),
    confirmation_url: `https://fareharbor.com/embeds/book/${company}/items/${itemPk}/booking/${uuid}/`,
    dashboard_url: `https://fareharbor.com/${company}/dashboard/bookings/${pk}/`,
    is_eligible_for_cancellation: true,
    arrival: null,
    company: {
      name:
        company.toLowerCase() === "coastalhelicopters"
          ? "Coastal Helicopters"
          : company,
      shortname: company,
      currency: "usd",
    },
    affiliate_company: {
      name: "Welcome to Alaska Tours",
      shortname: "welcometoalaskatours",
      currency: "usd",
      ...(input.handoffId ? { asn_parameter: input.handoffId } : {}),
    },
    contact: {
      name,
      phone,
      email,
      normalized_phone: phone.replace(/[^0-9+]/g, ""),
      language: "en-us",
    },
    availability: {
      pk: availabilityPk,
      start_at: startAt,
      end_at: endAt,
      capacity: 12,
      item: {
        pk: itemPk,
        name: itemName,
      },
    },
    customers: normalizedCustomers.map((c, idx) => ({
      pk: pk * 10 + idx + 1,
      checkin_url: null,
      checkin_status: null,
      customer_type_rate: {
        pk: customerTypeRatePk,
        total: unitPrice,
        capacity: 12,
        customer_prototype: {
          pk: 2259156,
          display_name: "Standard Passenger",
          total: unitPrice,
        },
        customer_type: {
          pk: 645950,
          note: "Up to 250 lbs with gear",
          singular: "Standard Passenger",
          plural: "Standard Passengers",
        },
      },
      custom_field_values: (c.custom_field_values || []).map((cf, cfIdx) => ({
        pk: pk * 100 + idx * 10 + cfIdx + 1,
        custom_field: cf.custom_field,
        value: cf.value,
        display_value: String(cf.value),
      })),
    })),
    custom_field_values: bookingFields.map((bf, bfIdx) => ({
      pk: pk * 100 + 90 + bfIdx + 1,
      custom_field: bf.custom_field,
      value: bf.value,
      display_value: String(bf.value),
    })),
    order: null,
    effective_cancellation_policy: {
      type: "hours-before-start",
      cutoff: 24,
    },
    receipt_subtotal: subtotal,
    receipt_taxes: taxes,
    receipt_total: total,
    amount_paid: total,
    invoice_price: invoicePrice,
    validation: {
      validated_via: validateUrl,
      is_bookable: true,
      validated_at: new Date().toISOString(),
      live_bookings_enabled: String(process.env.FH_BOOKINGS_ENABLED || "0") === "1",
    },
  };

  const kv = await getKV();
  if (kv) {
    await kv.set(`fh_booking:${uuid}`, bookingRecord, { ex: 60 * 60 * 24 * 30 });
  }

  return { booking: bookingRecord };
}

export async function getAuthorizedFareHarborBooking(params: {
  company: string;
  bookingUuid: string;
}): Promise<{
  source: "fareharbor_external_api" | "fareharbor_validated_kv";
  booking: FareHarborExternalBookingRecord | Record<string, unknown>;
}> {
  const { appKey, userKey } = getFareHarborCredentials();
  const company = String(params.company || "").trim();
  const bookingUuid = String(params.bookingUuid || "").trim();

  if (!company || !bookingUuid) {
    throw new Error("Missing company or bookingUuid.");
  }

  const fhUrl = `https://fareharbor.com/api/external/v1/companies/${encodeURIComponent(company)}/bookings/${encodeURIComponent(bookingUuid)}/`;
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
    const data = (await response.json().catch(() => null)) as
      | { booking?: Record<string, unknown> }
      | null;
    if (data?.booking) {
      return {
        source: "fareharbor_external_api",
        booking: data.booking,
      };
    }
  }

  const kv = await getKV();
  if (kv) {
    const stored = await kv.get<FareHarborExternalBookingRecord>(
      `fh_booking:${bookingUuid}`,
    );
    if (stored && typeof stored === "object") {
      return {
        source: "fareharbor_validated_kv",
        booking: stored,
      };
    }
  }

  const err = new Error(
    `FareHarbor booking ${bookingUuid} not found for company ${company}.`,
  );
  (err as Error & { status?: number }).status = 404;
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

