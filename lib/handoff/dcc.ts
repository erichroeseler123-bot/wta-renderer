import crypto from "crypto";
import { getKV } from "@/lib/kv";
import {
  dccCategoryToWtaCategory,
  dccEntityToWtaProduct,
  dccPortToWtaPort,
} from "@/lib/handoff/mappings";

export type DccCategory =
  | "whale-watching"
  | "glacier"
  | "helicopter"
  | "fishing"
  | "wildlife"
  | "city-tour";

export type DccToWtaIntentV1 = {
  source: "dcc";
  version: "1";
  handoffId: string;
  destination?: {
    stateCode?: string;
    regionSlug?: string;
    citySlug?: string;
    portSlug?: string;
  };
  traveler?: {
    partySize?: number;
    adults?: number;
    children?: number;
    cruiseShip?: string;
    cruiseDate?: string;
  };
  bookingIntent?: {
    category?: DccCategory;
    itemSlug?: string;
    date?: string;
    timeOfDay?: "morning" | "afternoon" | "evening";
    budgetTier?: "value" | "standard" | "premium";
  };
  context?: {
    nodeSlug?: string;
    referrerPath?: string;
    campaign?: string;
    authorityTopic?: string;
  };
};

export type ResolvedHandoff = {
  intent: DccToWtaIntentV1;
  targetPath: string;
  targetParams: URLSearchParams;
  targetUrl: string;
  sourceMode: "id" | "payload";
};

type ReceivedHandoffRecord = {
  handoffId: string;
  source: "dcc";
  version: "1";
  sourceMode: "id" | "payload";
  targetUrl: string;
  intent: DccToWtaIntentV1;
  receivedAt: string;
  userAgent: string;
  ip: string;
};

const HANDOFF_TTL_SECONDS = 60 * 60 * 24 * 30;
const HANDOFF_RECENT_INDEX_KEY = "handoff:received:recent";
const HANDOFF_RECENT_MAX = 300;

function safeSlug(v: unknown): string | undefined {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return undefined;
  return s;
}

function safeString(v: unknown): string | undefined {
  const s = String(v || "").trim();
  return s || undefined;
}

function safeDate(v: unknown): string | undefined {
  const s = String(v || "").trim();
  if (!s) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  return s;
}

function safePositiveInt(v: unknown): number | undefined {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

function parseBase64Url(input: string) {
  const pad = 4 - (input.length % 4 || 4);
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return Buffer.from(b64, "base64").toString("utf8");
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeEq(a: string, b: string) {
  const aa = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function normalizeIntent(raw: unknown): DccToWtaIntentV1 | null {
  if (!raw || typeof raw !== "object") return null;

  const src = raw as Record<string, unknown>;
  if (src.source !== "dcc") return null;
  if (String(src.version || "") !== "1") return null;

  const handoffId = safeString(src.handoffId);
  if (!handoffId) return null;

  const destinationRaw = (src.destination && typeof src.destination === "object")
    ? (src.destination as Record<string, unknown>)
    : undefined;

  const travelerRaw = (src.traveler && typeof src.traveler === "object")
    ? (src.traveler as Record<string, unknown>)
    : undefined;

  const bookingRaw = (src.bookingIntent && typeof src.bookingIntent === "object")
    ? (src.bookingIntent as Record<string, unknown>)
    : undefined;

  const contextRaw = (src.context && typeof src.context === "object")
    ? (src.context as Record<string, unknown>)
    : undefined;

  const category = safeSlug(bookingRaw?.category) as DccCategory | undefined;

  return {
    source: "dcc",
    version: "1",
    handoffId,
    destination: destinationRaw
      ? {
          stateCode: safeSlug(destinationRaw.stateCode),
          regionSlug: safeSlug(destinationRaw.regionSlug),
          citySlug: safeSlug(destinationRaw.citySlug),
          portSlug: safeSlug(destinationRaw.portSlug),
        }
      : undefined,
    traveler: travelerRaw
      ? {
          partySize: safePositiveInt(travelerRaw.partySize),
          adults: safePositiveInt(travelerRaw.adults),
          children: safePositiveInt(travelerRaw.children),
          cruiseShip: safeString(travelerRaw.cruiseShip),
          cruiseDate: safeDate(travelerRaw.cruiseDate),
        }
      : undefined,
    bookingIntent: bookingRaw
      ? {
          category,
          itemSlug: safeSlug(bookingRaw.itemSlug),
          date: safeDate(bookingRaw.date),
          timeOfDay: safeSlug(bookingRaw.timeOfDay) as "morning" | "afternoon" | "evening" | undefined,
          budgetTier: safeSlug(bookingRaw.budgetTier) as "value" | "standard" | "premium" | undefined,
        }
      : undefined,
    context: contextRaw
      ? {
          nodeSlug: safeSlug(contextRaw.nodeSlug),
          referrerPath: safeString(contextRaw.referrerPath),
          campaign: safeString(contextRaw.campaign),
          authorityTopic: safeSlug(contextRaw.authorityTopic),
        }
      : undefined,
  };
}

function resolveRedirect(intent: DccToWtaIntentV1): { path: string; params: URLSearchParams } {
  const params = new URLSearchParams();

  const mappedPort = intent.destination?.portSlug
    ? dccPortToWtaPort[intent.destination.portSlug]
    : "";
  const mappedCategory = intent.bookingIntent?.category
    ? dccCategoryToWtaCategory[intent.bookingIntent.category]
    : "";

  if (mappedPort) params.set("port", mappedPort);
  if (mappedCategory) params.set("category", mappedCategory);

  const date = intent.bookingIntent?.date || intent.traveler?.cruiseDate;
  if (date) params.set("date", date);

  const partySize = intent.traveler?.partySize ||
    ((intent.traveler?.adults || 0) + (intent.traveler?.children || 0)) ||
    undefined;
  if (partySize) params.set("party", String(partySize));

  if (intent.context?.campaign) params.set("campaign", intent.context.campaign);
  if (intent.context?.authorityTopic) params.set("topic", intent.context.authorityTopic);
  if (intent.context?.referrerPath) params.set("referrerPath", intent.context.referrerPath);

  params.set("handoffSource", intent.source);
  params.set("handoffId", intent.handoffId);

  const itemSlug = intent.bookingIntent?.itemSlug || "";
  if (itemSlug && dccEntityToWtaProduct[itemSlug]) {
    const mapped = dccEntityToWtaProduct[itemSlug];
    return {
      path: `/tours/${encodeURIComponent(mapped.company)}/${encodeURIComponent(String(mapped.itemPk))}`,
      params,
    };
  }

  return { path: "/tours", params };
}

export async function parseAndResolveDccHandoff(url: URL, baseUrl: string): Promise<ResolvedHandoff> {
  const id = safeString(url.searchParams.get("id"));
  const payload = safeString(url.searchParams.get("payload"));
  const sig = safeString(url.searchParams.get("sig"));

  let sourceMode: "id" | "payload";
  let intent: DccToWtaIntentV1 | null = null;

  if (id) {
    sourceMode = "id";
    const kv = await getKV();
    if (!kv) throw new Error("KV not configured for id-based handoff.");
    const raw = await kv.get<unknown>(`handoff:dcc:${id}`);
    intent = normalizeIntent(raw);
    if (!intent) throw new Error("Invalid or missing handoff intent by id.");
  } else if (payload) {
    sourceMode = "payload";
    const secret = String(process.env.DCC_WTA_HANDOFF_SECRET || process.env.WTA_HANDOFF_SECRET || "").trim();
    if (secret) {
      if (!sig) throw new Error("Missing handoff signature.");
      const expected = signPayload(payload, secret);
      if (!timingSafeEq(expected, sig)) throw new Error("Invalid handoff signature.");
    }

    const rawText = parseBase64Url(payload);
    const rawObj = JSON.parse(rawText);
    intent = normalizeIntent(rawObj);
    if (!intent) throw new Error("Invalid handoff payload.");
  } else {
    throw new Error("Missing handoff id or payload.");
  }

  const { path, params } = resolveRedirect(intent);
  const targetUrl = new URL(path, baseUrl);
  if (params.toString()) targetUrl.search = params.toString();

  return {
    intent,
    sourceMode,
    targetPath: path,
    targetParams: params,
    targetUrl: targetUrl.toString(),
  };
}

export async function recordResolvedHandoff(resolved: ResolvedHandoff, req: Request) {
  const kv = await getKV();
  if (!kv) return;

  const key = `handoff:received:${resolved.intent.handoffId}`;
  const now = new Date().toISOString();
  const row: ReceivedHandoffRecord = {
    handoffId: resolved.intent.handoffId,
    source: resolved.intent.source,
    version: resolved.intent.version,
    sourceMode: resolved.sourceMode,
    targetUrl: resolved.targetUrl,
    intent: resolved.intent,
    receivedAt: now,
    userAgent: req.headers.get("user-agent") || "",
    ip:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "",
  };

  await kv.set(key, row, { ex: HANDOFF_TTL_SECONDS });

  const recent = (await kv.get<string[]>(HANDOFF_RECENT_INDEX_KEY)) || [];
  const next = [
    resolved.intent.handoffId,
    ...recent.filter((x) => x !== resolved.intent.handoffId),
  ].slice(0, HANDOFF_RECENT_MAX);

  await kv.set(HANDOFF_RECENT_INDEX_KEY, next, { ex: HANDOFF_TTL_SECONDS });
}

export async function listRecentReceivedHandoffs(limit = 50): Promise<ReceivedHandoffRecord[]> {
  const kv = await getKV();
  if (!kv) return [];

  const recentIds = (await kv.get<string[]>(HANDOFF_RECENT_INDEX_KEY)) || [];
  const out: ReceivedHandoffRecord[] = [];

  for (const id of recentIds.slice(0, Math.max(1, Math.min(100, limit)))) {
    const row = await kv.get<ReceivedHandoffRecord>(`handoff:received:${id}`);
    if (row) out.push(row);
  }

  return out;
}

export function createSignedPayloadForWtaHandoff(
  intent: DccToWtaIntentV1,
  secret: string,
): { payload: string; sig: string } {
  const payload = Buffer.from(JSON.stringify(intent), "utf8").toString("base64url");
  const sig = signPayload(payload, secret);
  return { payload, sig };
}

export function buildWtaHandoffUrlFromPayload(opts: {
  wtaOrigin: string;
  payload: string;
  sig?: string;
}) {
  const u = new URL("/handoff/dcc", opts.wtaOrigin);
  u.searchParams.set("payload", opts.payload);
  if (opts.sig) u.searchParams.set("sig", opts.sig);
  return u.toString();
}

export function buildWtaHandoffUrlFromIntent(opts: {
  wtaOrigin: string;
  intent: DccToWtaIntentV1;
  secret?: string;
}) {
  if (!opts.secret) {
    const payload = Buffer.from(JSON.stringify(opts.intent), "utf8").toString("base64url");
    return buildWtaHandoffUrlFromPayload({ wtaOrigin: opts.wtaOrigin, payload });
  }

  const { payload, sig } = createSignedPayloadForWtaHandoff(opts.intent, opts.secret);
  return buildWtaHandoffUrlFromPayload({ wtaOrigin: opts.wtaOrigin, payload, sig });
}

export function buildWtaHandoffUrlFromId(opts: { wtaOrigin: string; id: string }) {
  const u = new URL("/handoff/dcc", opts.wtaOrigin);
  u.searchParams.set("id", opts.id);
  return u.toString();
}
