import { getKV } from "@/lib/kv";

export const DCC_SATELLITE_ID = "welcome-to-alaska" as const;

export const DCC_SATELLITE_EVENT_TYPES = [
  "handoff_viewed",
  "lead_captured",
  "booking_started",
  "booking_completed",
  "booking_failed",
  "booking_cancelled",
  "status_updated",
  "traveler_returned",
  "forwarded_to_partner",
  "accepted_from_partner",
  "partner_booking_completed",
  "partner_booking_failed",
] as const;

export type DccSatelliteEventType = (typeof DCC_SATELLITE_EVENT_TYPES)[number];

export type DccSatelliteEventPayload = {
  handoffId: string;
  satelliteId: typeof DCC_SATELLITE_ID;
  eventType: DccSatelliteEventType;
  occurredAt?: string;
  source?: string;
  sourcePath?: string;
  externalReference?: string;
  status?: string;
  stage?: string;
  message?: string;
  traveler?: {
    email?: string;
    phone?: string;
    name?: string;
    partySize?: number;
  };
  attribution?: {
    sourceSlug?: string;
    sourcePage?: string;
    topicSlug?: string;
  };
  booking?: {
    venueSlug?: string;
    portSlug?: string;
    citySlug?: string;
    productSlug?: string;
    eventDate?: string;
    quantity?: number;
    currency?: string;
    amount?: number;
  };
  partner?: {
    fromSite?: string;
    toSite?: string;
    partnerHandoffId?: string;
    reason?: string;
  };
  metadata?: Record<string, string | number | boolean | null>;
};

export type DccCallbackAuditRow = {
  auditId: string;
  handoffId: string;
  eventType: DccSatelliteEventType;
  endpoint: string | null;
  ok: boolean;
  skipped: boolean;
  responseStatus: number | null;
  responseBody: string | null;
  error: string | null;
  attemptedAt: string;
  externalReference: string | null;
  payload: DccSatelliteEventPayload;
};

const CALLBACK_TTL_SECONDS = 60 * 60 * 24 * 30;
const CALLBACK_RECENT_INDEX_KEY = "dcc:satellite-callbacks:recent";
const CALLBACK_RECENT_MAX = 300;
const PARR_ORIGIN = "https://www.partyatredrocks.com";
const CANONICAL_PORT_SLUGS: Record<string, string> = {
  juneau: "juneau-alaska",
  "juneau-alaska": "juneau-alaska",
  ketchikan: "ketchikan-alaska",
  "ketchikan-alaska": "ketchikan-alaska",
  skagway: "skagway-alaska",
  "skagway-alaska": "skagway-alaska",
  sitka: "sitka-alaska",
  "sitka-alaska": "sitka-alaska",
  "icy-strait-point": "icy-strait-point-alaska",
  "icy-strait-point-alaska": "icy-strait-point-alaska",
};

function cleanString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeCurrency(value: unknown) {
  const next = cleanString(value);
  return next ? next.toUpperCase().slice(0, 3) : undefined;
}

function normalizePortSlug(value: unknown) {
  const next = cleanString(value)?.toLowerCase();
  return next ? CANONICAL_PORT_SLUGS[next] || next : undefined;
}

export function canonicalizePortSlug(value: unknown) {
  return normalizePortSlug(value);
}

export function inferDccSourceSlug(sourcePage?: string, fallback?: string) {
  const page = cleanString(sourcePage) || "";
  if (page.includes("/cruises/port/") || page.includes("/ports/")) return "dcc-cruises-port";
  return cleanString(fallback);
}

function getDccEventsEndpoint() {
  return (
    cleanString(process.env.DCC_CALLBACK_URL) ||
    cleanString(process.env.DCC_WTA_EVENTS_URL) ||
    cleanString(process.env.DCC_SATELLITE_EVENTS_URL) ||
    cleanString(process.env.DCC_WTA_WEBHOOK_URL) ||
    "https://www.destinationcommandcenter.com/api/internal/satellite-handoffs/events"
  );
}

function getDccEventsToken() {
  return (
    cleanString(process.env.DCC_WTA_WEBHOOK_TOKEN) ||
    cleanString(process.env.DCC_SATELLITE_WEBHOOK_TOKEN) ||
    null
  );
}

function callbacksEnabled() {
  const raw = cleanString(process.env.DCC_CALLBACKS_ENABLED);
  if (!raw) return true;
  return raw === "1" || raw === "true" || raw === "yes";
}

function normalizePayload(input: DccSatelliteEventPayload): DccSatelliteEventPayload {
  const metadata =
    input.metadata && typeof input.metadata === "object"
      ? Object.fromEntries(
          Object.entries(input.metadata)
            .map(([key, value]) => {
              if (typeof value === "string") return [key, cleanString(value) || null] as const;
              if (typeof value === "number" || typeof value === "boolean" || value === null) return [key, value] as const;
              return [key, null] as const;
            })
            .filter((entry) => entry[1] !== undefined),
        )
      : undefined;

  return {
    ...input,
    handoffId: cleanString(input.handoffId) || "",
    satelliteId: DCC_SATELLITE_ID,
    occurredAt: cleanString(input.occurredAt) || new Date().toISOString(),
    source: cleanString(input.source) || "wta",
    sourcePath: cleanString(input.sourcePath),
    externalReference: cleanString(input.externalReference),
    status: cleanString(input.status),
    stage: cleanString(input.stage),
    message: cleanString(input.message),
    traveler: input.traveler
      ? {
          email: cleanString(input.traveler.email),
          phone: cleanString(input.traveler.phone),
          name: cleanString(input.traveler.name),
          partySize: safeNumber(input.traveler.partySize),
        }
      : undefined,
    attribution: input.attribution
      ? {
          sourceSlug: cleanString(input.attribution.sourceSlug),
          sourcePage: cleanString(input.attribution.sourcePage),
          topicSlug: cleanString(input.attribution.topicSlug),
        }
      : undefined,
    booking: input.booking
      ? {
          venueSlug: cleanString(input.booking.venueSlug),
          portSlug: normalizePortSlug(input.booking.portSlug),
          citySlug: cleanString(input.booking.citySlug),
          productSlug: cleanString(input.booking.productSlug),
          eventDate: cleanString(input.booking.eventDate),
          quantity: safeNumber(input.booking.quantity),
          currency: normalizeCurrency(input.booking.currency),
          amount: safeNumber(input.booking.amount),
        }
      : undefined,
    partner: input.partner
      ? {
          fromSite: cleanString(input.partner.fromSite),
          toSite: cleanString(input.partner.toSite),
          partnerHandoffId: cleanString(input.partner.partnerHandoffId),
          reason: cleanString(input.partner.reason),
        }
      : undefined,
    metadata,
  };
}

async function recordAudit(row: DccCallbackAuditRow) {
  const kv = await getKV();
  if (!kv) return row;

  await kv.set(`dcc:satellite-callback:${row.auditId}`, row, { ex: CALLBACK_TTL_SECONDS });

  const recent = (await kv.get<string[]>(CALLBACK_RECENT_INDEX_KEY)) || [];
  const next = [row.auditId, ...recent.filter((value) => value !== row.auditId)].slice(0, CALLBACK_RECENT_MAX);
  await kv.set(CALLBACK_RECENT_INDEX_KEY, next, { ex: CALLBACK_TTL_SECONDS });

  await kv.set(`dcc:satellite-callback:latest:${row.handoffId}`, row, { ex: CALLBACK_TTL_SECONDS });
  return row;
}

export async function emitDccSatelliteEvent(input: DccSatelliteEventPayload) {
  const payload = normalizePayload(input);
  const endpoint = getDccEventsEndpoint();
  const attemptedAt = new Date().toISOString();
  const auditId = `${payload.handoffId}:${payload.eventType}:${Date.now()}`;

  if (!payload.handoffId || !endpoint) {
    return recordAudit({
      auditId,
      handoffId: payload.handoffId || "missing-handoff-id",
      eventType: payload.eventType,
      endpoint,
      ok: false,
      skipped: true,
      responseStatus: null,
      responseBody: null,
      error: endpoint ? "missing_handoff_id" : "missing_dcc_events_endpoint",
      attemptedAt,
      externalReference: payload.externalReference || null,
      payload,
    });
  }

  if (!callbacksEnabled()) {
    return recordAudit({
      auditId,
      handoffId: payload.handoffId,
      eventType: payload.eventType,
      endpoint,
      ok: false,
      skipped: true,
      responseStatus: null,
      responseBody: null,
      error: "dcc_callbacks_disabled",
      attemptedAt,
      externalReference: payload.externalReference || null,
      payload,
    });
  }

  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    const token = getDccEventsToken();
    if (token) headers["x-dcc-satellite-token"] = token;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    });

    const responseBody = await response.text().catch(() => "");
    let error: string | null = null;
    if (!response.ok) {
      error = cleanString(responseBody) || `http_${response.status}`;
    }

    return recordAudit({
      auditId,
      handoffId: payload.handoffId,
      eventType: payload.eventType,
      endpoint,
      ok: response.ok,
      skipped: false,
      responseStatus: response.status,
      responseBody: cleanString(responseBody) || null,
      error,
      attemptedAt,
      externalReference: payload.externalReference || null,
      payload,
    });
  } catch (error: unknown) {
    return recordAudit({
      auditId,
      handoffId: payload.handoffId,
      eventType: payload.eventType,
      endpoint,
      ok: false,
      skipped: false,
      responseStatus: null,
      responseBody: null,
      error: error instanceof Error ? error.message : String(error),
      attemptedAt,
      externalReference: payload.externalReference || null,
      payload,
    });
  }
}

export async function listRecentDccSatelliteCallbacks(limit = 50): Promise<DccCallbackAuditRow[]> {
  const kv = await getKV();
  if (!kv) return [];

  const ids = (await kv.get<string[]>(CALLBACK_RECENT_INDEX_KEY)) || [];
  const out: DccCallbackAuditRow[] = [];

  for (const id of ids.slice(0, Math.max(1, Math.min(limit, 100)))) {
    const row = await kv.get<DccCallbackAuditRow>(`dcc:satellite-callback:${id}`);
    if (row) out.push(row);
  }

  return out;
}

export async function getLatestDccSatelliteCallback(handoffId: string) {
  const kv = await getKV();
  if (!kv) return null;
  return kv.get<DccCallbackAuditRow>(`dcc:satellite-callback:latest:${handoffId}`);
}

export function buildDccReturnUrl(
  rawReturnUrl: string | undefined,
  params: Record<string, string | number | boolean | undefined> = {},
) {
  const base = cleanString(rawReturnUrl);
  if (!base) return null;

  try {
    const url = new URL(base);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function buildParrPartnerForwardUrl(params: {
  handoffId: string;
  dccReturnUrl?: string;
  sourcePage?: string;
  eventDate?: string;
  artist?: string;
  event?: string;
  path?: string;
}) {
  const url = new URL(params.path || "/book/red-rocks-amphitheatre", PARR_ORIGIN);
  url.searchParams.set("dcc_handoff_id", params.handoffId);
  url.searchParams.set("source", "dcc");
  url.searchParams.set("source_slug", "wta-network-forward");
  url.searchParams.set("source_page", "/handoff/partner/partyatredrocks");
  url.searchParams.set("topic", "concert-transport");
  url.searchParams.set("venue", "red-rocks-amphitheatre");
  if (params.eventDate) url.searchParams.set("date", params.eventDate);
  if (params.artist) url.searchParams.set("artist", params.artist);
  if (params.event) url.searchParams.set("event", params.event);
  url.searchParams.set("partner_satellite", "welcome-to-alaska");
  url.searchParams.set("partner_reason", "traveler_reuse");
  url.searchParams.set("partner_handoff_id", params.handoffId);
  if (params.dccReturnUrl) url.searchParams.set("dcc_return", params.dccReturnUrl);
  return url.toString();
}
