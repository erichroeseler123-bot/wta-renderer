import { getKV } from "@/lib/kv";

export const PLAN_EVENT_TYPES = [
  "requested_lane",
  "resolved_lane",
  "shortlist_impression",
  "shortlist_click",
  "detail_view",
  "calendar_start",
  "checkout_start",
] as const;

export type PlanEventType = (typeof PLAN_EVENT_TYPES)[number];

export type PlanEvent = {
  event: PlanEventType;
  requestedLane?: string;
  resolvedLane?: string;
  degradedFallback?: boolean;
  reason?: string;
  productSlug?: string;
  rank?: number;
  port?: string;
  topic?: string;
  subtype?: string;
  partyType?: string;
  timeWindow?: string;
  budgetBand?: string;
  sourcePage?: string;
};

export type PlanEventRow = PlanEvent & {
  eventId: string;
  occurredAt: string;
  path?: string;
};

const PLAN_EVENT_TTL_SECONDS = 60 * 60 * 24 * 30;
const PLAN_EVENT_RECENT_INDEX_KEY = "plan-events:recent";
const PLAN_EVENT_RECENT_MAX = 500;

function cleanString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function cleanNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return undefined;
}

export function normalizePlanEvent(input: Record<string, unknown>): PlanEvent {
  return {
    event: PLAN_EVENT_TYPES.includes(input.event as PlanEventType)
      ? (input.event as PlanEventType)
      : "requested_lane",
    requestedLane: cleanString(input.requestedLane),
    resolvedLane: cleanString(input.resolvedLane),
    degradedFallback: normalizeBoolean(input.degradedFallback),
    reason: cleanString(input.reason),
    productSlug: cleanString(input.productSlug),
    rank: cleanNumber(input.rank),
    port: cleanString(input.port),
    topic: cleanString(input.topic),
    subtype: cleanString(input.subtype),
    partyType: cleanString(input.partyType),
    timeWindow: cleanString(input.timeWindow),
    budgetBand: cleanString(input.budgetBand),
    sourcePage: cleanString(input.sourcePage),
  };
}

export async function recordPlanEvent(input: PlanEvent & { path?: string }) {
  const row: PlanEventRow = {
    ...input,
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  };

  const kv = await getKV();
  if (!kv) return row;

  await kv.set(`plan-event:${row.eventId}`, row, { ex: PLAN_EVENT_TTL_SECONDS });
  const recent = (await kv.get<string[]>(PLAN_EVENT_RECENT_INDEX_KEY)) || [];
  const next = [row.eventId, ...recent.filter((value) => value !== row.eventId)].slice(0, PLAN_EVENT_RECENT_MAX);
  await kv.set(PLAN_EVENT_RECENT_INDEX_KEY, next, { ex: PLAN_EVENT_TTL_SECONDS });

  return row;
}

export async function listRecentPlanEvents(limit = 50) {
  const kv = await getKV();
  if (!kv) return [] as PlanEventRow[];

  const ids = ((await kv.get<string[]>(PLAN_EVENT_RECENT_INDEX_KEY)) || []).slice(0, Math.max(1, Math.min(200, limit)));
  const rows = await Promise.all(ids.map((id) => kv.get<PlanEventRow>(`plan-event:${id}`)));

  return rows.filter((row): row is PlanEventRow => Boolean(row));
}
