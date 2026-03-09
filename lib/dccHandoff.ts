export type DccToWtaHandoff = {
  source: "dcc";
  version: "1";
  handoffId: string;

  destination?: {
    regionSlug?: string;
    citySlug?: string;
    portSlug?: string;
  };

  traveler?: {
    adults?: number;
    children?: number;
    partySize?: number;
    cruiseDate?: string;
    cruiseShip?: string;
    cruiseShipSlug?: string;
  };

  intent?: {
    category?: string;
    itemSlug?: string;
    date?: string;
    timeOfDay?: "morning" | "afternoon" | "evening";
    budgetTier?: "value" | "standard" | "premium";
  };

  context?: {
    referrerPath?: string;
    authorityTopic?: string;
    campaign?: string;
    nodeSlug?: string;
  };
};

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function cleanString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
}

function cleanInt(v: unknown): number | undefined {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  const i = Math.floor(n);
  return i > 0 ? i : undefined;
}

export function normalizeDccToWtaHandoff(input: unknown): DccToWtaHandoff {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const destination = raw.destination && typeof raw.destination === "object"
    ? (raw.destination as Record<string, unknown>)
    : {};

  const traveler = raw.traveler && typeof raw.traveler === "object"
    ? (raw.traveler as Record<string, unknown>)
    : {};

  const intent = raw.intent && typeof raw.intent === "object"
    ? (raw.intent as Record<string, unknown>)
    : {};

  const context = raw.context && typeof raw.context === "object"
    ? (raw.context as Record<string, unknown>)
    : {};

  const normalized: DccToWtaHandoff = {
    source: "dcc",
    version: "1",
    handoffId: cleanString(raw.handoffId) || `dcc_${Date.now()}`,
  };

  const outDestination = {
    regionSlug: cleanString(destination.regionSlug),
    citySlug: cleanString(destination.citySlug),
    portSlug: cleanString(destination.portSlug),
  };

  const outTraveler = {
    adults: cleanInt(traveler.adults),
    children: cleanInt(traveler.children),
    partySize: cleanInt(traveler.partySize),
    cruiseDate: isIsoDate(traveler.cruiseDate) ? traveler.cruiseDate : undefined,
    cruiseShip: cleanString(traveler.cruiseShip),
    cruiseShipSlug: cleanString(traveler.cruiseShipSlug),
  };

  const timeOfDay = cleanString(intent.timeOfDay);
  const budgetTier = cleanString(intent.budgetTier);

  const outIntent: DccToWtaHandoff["intent"] = {
    category: cleanString(intent.category),
    itemSlug: cleanString(intent.itemSlug),
    date: isIsoDate(intent.date) ? intent.date : undefined,
    timeOfDay:
      timeOfDay === "morning" || timeOfDay === "afternoon" || timeOfDay === "evening"
        ? timeOfDay
        : undefined,
    budgetTier:
      budgetTier === "value" || budgetTier === "standard" || budgetTier === "premium"
        ? budgetTier
        : undefined,
  };

  const outContext = {
    referrerPath: cleanString(context.referrerPath),
    authorityTopic: cleanString(context.authorityTopic),
    campaign: cleanString(context.campaign),
    nodeSlug: cleanString(context.nodeSlug),
  };

  if (Object.values(outDestination).some(Boolean)) normalized.destination = outDestination;
  if (Object.values(outTraveler).some((v) => v !== undefined)) normalized.traveler = outTraveler;
  if (Object.values(outIntent).some((v) => v !== undefined)) normalized.intent = outIntent;
  if (Object.values(outContext).some(Boolean)) normalized.context = outContext;

  if (!normalized.traveler?.partySize) {
    const adults = normalized.traveler?.adults || 0;
    const children = normalized.traveler?.children || 0;
    const total = adults + children;
    if (total > 0) {
      normalized.traveler = {
        ...(normalized.traveler || {}),
        partySize: total,
      };
    }
  }

  return normalized;
}

export function encodeHandoffPayload(payload: DccToWtaHandoff): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeHandoffPayload(payload: string): unknown {
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json);
}
