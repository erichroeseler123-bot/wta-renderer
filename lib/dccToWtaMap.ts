import type { DccToWtaHandoff } from "@/lib/dccHandoff";

export type WtaResolvedRoute = {
  pathname: string;
  query: Record<string, string>;
  reason: string;
};

const PORT_ROUTE_MAP: Record<string, string> = {
  juneau: "/ports/juneau",
  ketchikan: "/ports/ketchikan",
  skagway: "/ports/skagway",
  sitka: "/ports/sitka",
  "icy-strait-point": "/ports/icy-strait-point",
};

const CATEGORY_FILTER_MAP: Record<string, string> = {
  "whale-watching": "whale-watching",
  glacier: "glacier",
  fishing: "fishing",
  wildlife: "wildlife",
  helicopter: "helicopter",
  "city-tour": "city-tour",
  "shore-excursion": "shore-excursion",
};

const ITEM_ROUTE_MAP: Record<string, string> = {
  // examples; replace with real WTA slugs/pages
  // "juneau-whale-watch": "/tours/juneau-whale-watch",
  // "mendenhall-glacier-tour": "/tours/mendenhall-glacier-tour",
  // "skagway-white-pass": "/tours/skagway-white-pass",
};

function addIf(query: Record<string, string>, key: string, value: unknown) {
  if (typeof value === "string" && value.trim()) query[key] = value.trim();
  else if (typeof value === "number" && Number.isFinite(value)) query[key] = String(value);
}

export function resolveDccHandoffToWtaRoute(handoff: DccToWtaHandoff): WtaResolvedRoute {
  const query: Record<string, string> = {
    source: "dcc",
    handoff_id: handoff.handoffId,
  };

  addIf(query, "referrer_path", handoff.context?.referrerPath);
  addIf(query, "authority_topic", handoff.context?.authorityTopic);
  addIf(query, "campaign", handoff.context?.campaign);
  addIf(query, "node_slug", handoff.context?.nodeSlug);

  addIf(query, "date", handoff.intent?.date || handoff.traveler?.cruiseDate);
  addIf(query, "partySize", handoff.traveler?.partySize);
  addIf(query, "adults", handoff.traveler?.adults);
  addIf(query, "children", handoff.traveler?.children);
  addIf(query, "cruiseShip", handoff.traveler?.cruiseShip);
  addIf(query, "cruiseShipSlug", handoff.traveler?.cruiseShipSlug);
  addIf(query, "timeOfDay", handoff.intent?.timeOfDay);
  addIf(query, "budgetTier", handoff.intent?.budgetTier);

  const itemSlug = handoff.intent?.itemSlug?.toLowerCase();
  if (itemSlug && ITEM_ROUTE_MAP[itemSlug]) {
    return {
      pathname: ITEM_ROUTE_MAP[itemSlug],
      query,
      reason: "matched_item_slug",
    };
  }

  const portSlug = handoff.destination?.portSlug?.toLowerCase();
  const category = handoff.intent?.category?.toLowerCase();

  if (portSlug && PORT_ROUTE_MAP[portSlug]) {
    const pathname = PORT_ROUTE_MAP[portSlug];
    if (category && CATEGORY_FILTER_MAP[category]) {
      query.category = CATEGORY_FILTER_MAP[category];
      return {
        pathname,
        query,
        reason: "matched_port_and_category",
      };
    }

    return {
      pathname,
      query,
      reason: "matched_port",
    };
  }

  if (category && CATEGORY_FILTER_MAP[category]) {
    query.category = CATEGORY_FILTER_MAP[category];
    return {
      pathname: "/tours",
      query,
      reason: "matched_category_only",
    };
  }

  return {
    pathname: "/tours",
    query,
    reason: "fallback_tours",
  };
}

export function buildRedirectUrl(pathname: string, query: Record<string, string>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
