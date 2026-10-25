import type { HelicopterTour } from "@/lib/helicopterTours";
import { cleanTourDescription, getProductOneLiner } from "@/lib/tourSeo";
import {
  appendWidgetContextToSearchParams,
  sanitizeEmbedDomain,
  type WidgetInitContext,
} from "@/lib/widgetContext";

export type WidgetLayoutMode = "card" | "compact";

export type WidgetTourStatus = "active" | "retired" | "not_found" | "unavailable";

export type WidgetPriceDisplay = {
  supported: boolean;
  amountLabel: string;
  currency: "USD" | null;
  basisLabel: string | null;
  fullLabel: string;
  stale?: boolean;
};

export type WidgetAccentTheme = {
  hex: string;
  textOnAccent: string;
  softBg: string;
  border: string;
};

export const DEFAULT_WIDGET_ACCENT = "#0f172a";

/**
 * Maximum age (14 days) for a maintained catalog price timestamp before the widget
 * automatically falls back to "Check current price".
 */
export const MAX_WIDGET_PRICE_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export const WIDGET_MIN_HEIGHT_PX = 120;
export const WIDGET_MAX_HEIGHT_PX = 1600;

const OPERATOR_NAMES: Record<string, string> = {
  beyondak: "Beyond Alaska",
  "alaska-galore-juneau-whale-watching": "Alaska Galore Whale Watching",
  akhummer: "Alaska Hummer Adventures",
  alaskatales: "Alaska Tales",
  aktraveladventures: "Alaska Travel Adventures",
  exclusivealaska: "Exclusive Alaska",
  coastalhelicopters: "Coastal Helicopters",
  dolphintours: "Dolphin Jet Boat Tours",
  moorecharters: "Moore Charters",
  alaskarainforest: "Alaska Rainforest Sanctuary",
  ketchikanadventurevue: "Ketchikan AdventureVue",
  akduck: "Alaska Duck Tours",
  northstartrekking: "NorthStar Trekking",
  kayakketchikan: "Kayak Ketchikan",
  skagwayscooters: "Skagway Scooters",
  snorkelalaska: "Snorkel Alaska",
  taquanair: "Taquan Air",
  "temsco-summercamp-juneau": "TEMSCO Helicopters",
  "temscoair-juneau": "TEMSCO Helicopters",
  "temscoair-skagway": "TEMSCO Helicopters",
  wingsairways: "Wings Airways",
};

const PORT_NAMES: Record<string, string> = {
  juneau: "Juneau, Alaska",
  skagway: "Skagway, Alaska",
  ketchikan: "Ketchikan, Alaska",
};

export function getOperatorDisplayName(company?: string | null): string {
  const key = String(company || "").trim().toLowerCase();
  if (!key) return "Welcome to Alaska Tours";
  return (
    OPERATOR_NAMES[key] ||
    key
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function getPortDisplayName(port?: string | null): string {
  const key = String(port || "").trim().toLowerCase();
  if (!key) return "Alaska Port";
  return PORT_NAMES[key] || `${key.charAt(0).toUpperCase()}${key.slice(1)}, Alaska`;
}

export function sanitizeWidgetLayout(input?: string | null): WidgetLayoutMode {
  const normalized = String(input || "").trim().toLowerCase();
  return normalized === "compact" || normalized === "horizontal" ? "compact" : "card";
}

/**
 * Sanitizes an optional placement label (e.g. "hotel-homepage").
 * Placement labels are strictly alphanumeric/hyphen/underscore tags up to 64 chars.
 * They can never contain URLs, credentials, or override operator/payment configuration.
 */
export function sanitizePlacementLabel(input?: string | null): string | undefined {
  if (typeof input !== "string") return undefined;
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 64);

  if (!cleaned) return undefined;

  // Guard against accidental or malicious attempts to pass credential-like keys
  const forbiddenPrefixes = ["sk_live", "sk_test", "pk_live", "pk_test", "whsec", "fh_", "http"];
  if (forbiddenPrefixes.some((prefix) => cleaned.startsWith(prefix))) {
    return undefined;
  }

  return cleaned;
}

export function sanitizeAccentColor(input?: string | null): WidgetAccentTheme {
  const raw = String(input || "").trim().replace(/^#/, "");
  const isValidHex = /^[0-9a-fA-F]{6}$/.test(raw);
  const hex = isValidHex ? `#${raw.toLowerCase()}` : DEFAULT_WIDGET_ACCENT;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Relative luminance (WCAG)
  const srgb = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  const textOnAccent = luminance > 0.42 ? "#0f172a" : "#ffffff";

  return {
    hex,
    textOnAccent,
    softBg: `rgba(${r}, ${g}, ${b}, 0.08)`,
    border: `rgba(${r}, ${g}, ${b}, 0.22)`,
  };
}

/**
 * Evaluates whether a tour has a verified, maintained, and fresh full price in the catalog.
 * Returns "Check current price" whenever pricing is missing, contact-only, deposit-only, or stale.
 */
export function formatWidgetPrice(
  tour:
    | (Pick<HelicopterTour, "fromPrice" | "description" | "company" | "pk"> & {
        priceUpdatedAt?: string | number | null;
      })
    | null
    | undefined,
  options?: {
    nowMs?: number;
    maxAgeMs?: number;
    requireFreshTimestamp?: boolean;
  },
): WidgetPriceDisplay {
  const fallback: WidgetPriceDisplay = {
    supported: false,
    amountLabel: "Check current price",
    currency: null,
    basisLabel: null,
    fullLabel: "Check current price",
  };

  if (!tour) return fallback;

  // Enforce price freshness rule whenever priceUpdatedAt is supplied or required
  if (tour.priceUpdatedAt !== undefined || options?.requireFreshTimestamp) {
    const nowMs = options?.nowMs ?? Date.now();
    const maxAgeMs = options?.maxAgeMs ?? MAX_WIDGET_PRICE_AGE_MS;
    const rawTs = tour.priceUpdatedAt;
    const parsedTs =
      typeof rawTs === "number"
        ? rawTs
        : typeof rawTs === "string" && rawTs.trim()
          ? Date.parse(rawTs.trim())
          : NaN;

    if (!Number.isFinite(parsedTs) || parsedTs <= 0 || nowMs - parsedTs > maxAgeMs) {
      return { ...fallback, stale: true };
    }
  }

  const company = String(tour.company || "").trim().toLowerCase();
  const pk = Number(tour.pk || 0);
  const description = String(tour.description || "");

  // Explicit contact-only or deposit-only checks
  if (company === "temscoair-juneau" && pk === 285755) {
    return fallback;
  }

  if (company === "northstartrekking" && pk !== 405050 && /25%\s*deposit/i.test(description)) {
    const descMatch = description.match(/\$\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
    if (!descMatch) {
      return fallback;
    }
  }

  const rawPrice = String(tour.fromPrice || "").trim();
  if (!rawPrice) return fallback;

  if (/contact\s+for\s+pricing|check\s+(?:live\s+|current\s+)?pric(?:e|ing)|call\s+for\s+price|tbd|n\/a/i.test(rawPrice)) {
    return fallback;
  }

  // Match dollar amount at start or after "From "
  const normalized = rawPrice.replace(/^From\s+/i, "").trim();
  const dollarMatch = normalized.match(/^\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)\s*(.*)$/);
  if (!dollarMatch) {
    return fallback;
  }

  const numericValue = Number(dollarMatch[1].replace(/,/g, ""));
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return fallback;
  }

  const formattedNumber = numericValue % 1 === 0 ? numericValue.toLocaleString("en-US") : numericValue.toFixed(2);
  let remainder = String(dollarMatch[2] || "").trim();

  // Handle dual-rate strings like "$79 Adult / $47 Child (Flat Rate)"
  if (/^Adult\s*\/\s*\$\s*[0-9]+/i.test(remainder)) {
    const basisMatch = remainder.match(/^(Adult\s*\/\s*\$[0-9,]+\s*Child)\s*(.*)$/i);
    if (basisMatch) {
      const dualAmount = `$${formattedNumber} ${basisMatch[1].trim()}`;
      const trailingBasis = basisMatch[2].trim().replace(/^\(|\)$/g, "") || "Flat Rate";
      return {
        supported: true,
        amountLabel: dualAmount,
        currency: "USD",
        basisLabel: trailingBasis,
        fullLabel: `${dualAmount} USD · ${trailingBasis}`,
      };
    }
  }

  const amountLabel = `$${formattedNumber}`;
  if (!remainder) {
    remainder = "Per Person";
  }

  return {
    supported: true,
    amountLabel,
    currency: "USD",
    basisLabel: remainder,
    fullLabel: `${amountLabel} USD · ${remainder}`,
  };
}

/**
 * Extracts a supported duration string from the tour's maintained fields.
 * Never invents a fallback duration when none exists in the catalog.
 */
export function formatWidgetDuration(
  tour: (Pick<HelicopterTour, "title" | "description" | "company" | "pk"> & { duration?: string }) | null | undefined,
): string | null {
  if (!tour) return null;

  if (typeof tour.duration === "string" && tour.duration.trim()) {
    return tour.duration.trim();
  }

  const company = String(tour.company || "").trim().toLowerCase();
  const pk = String(tour.pk || "");
  if (company === "northstartrekking" && pk === "405050") return "2 Hours 15 Minutes";
  if (company === "akduck" && pk === "4161") return "90 Minutes";
  if (company === "skagwayscooters" && pk === "13748") return "2 Hours";

  const sources = [String(tour.description || ""), String(tour.title || "")];

  for (const text of sources) {
    if (!text) continue;

    // 1. Compound hours and minutes: "3 Hours 15 Minutes", "2 Hours & 30 Minutes"
    const compoundMatch = text.match(/\b(\d+)\s*Hours?(?:\s*(?:&|and|,)\s*|\s+)(\d+)\s*(?:Minutes?|Mins?)\b/i);
    if (compoundMatch) {
      const h = Number(compoundMatch[1]);
      const m = Number(compoundMatch[2]);
      return `${h} ${h === 1 ? "Hour" : "Hours"} ${m} Minutes`;
    }

    // 2. Fractional hours with unicode/slash: "2 ½ Hours", "2 1/4 Hours"
    const fractionMatch = text.match(/\b(\d+)\s*([¼½¾]|1\/4|1\/2|3\/4)\s*Hours?\b/i);
    if (fractionMatch) {
      const h = Number(fractionMatch[1]);
      const frac = fractionMatch[2];
      const mins = frac === "¼" || frac === "1/4" ? 15 : frac === "½" || frac === "1/2" ? 30 : 45;
      return `${h} ${h === 1 ? "Hour" : "Hours"} ${mins} Minutes`;
    }

    // 3. Hour ranges: "2-3 Hours", "3 to 4 Hours", "2.5 - 3 Hours"
    const rangeMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)\s*(?:Hours?|Hrs?)\b/i);
    if (rangeMatch) {
      return `${rangeMatch[1]}–${rangeMatch[2]} Hours`;
    }

    // 4. Decimal or integer hours: "3.5 Hours", "6 Hours", "4-Hour", "2.25 Hours"
    const hoursMatch = text.match(/\b(\d+(?:\.\d+)?)(?:\s*|-)(?:Hours?|Hrs?)\b/i);
    if (hoursMatch) {
      const val = parseFloat(hoursMatch[1]);
      if (val === 2.25) return "2 Hours 15 Minutes";
      if (val === 2.5) return "2.5 Hours";
      if (val === 2.75) return "2 Hours 45 Minutes";
      if (val === 3.25) return "3 Hours 15 Minutes";
      if (val === 3.5) return "3.5 Hours";
      if (val === 4.5) return "4.5 Hours";
      if (val === 5.5) return "5.5 Hours";
      if (val === 6.5) return "6.5 Hours";
      return `${hoursMatch[1]} ${val === 1 ? "Hour" : "Hours"}`;
    }

    // 5. Minutes: "90 Minutes", "45 Mins"
    const minMatch = text.match(/\b(\d+)\s*(?:Minutes?|Mins?)\b/i);
    if (minMatch) {
      return `${minMatch[1]} Minutes`;
    }
  }

  return null;
}

/**
 * Strips unattributed promotional superlatives ("Customer Favorite!", "Voted the Top 10 Tour in US!", etc.)
 * so widget copy contains only factual excursion details.
 */
function stripUnattributedPromotionalClaims(text: string): string {
  return text
    .replace(/\bCustomer\s+Favorite!?\s*/gi, "")
    .replace(/\bVoted\s+the\s+Top\s+\d+\s+Tour\s+in\s+US!?\s*/gi, "")
    .replace(/\bMost\s+Popular\s+Tour[^|•!]*!?\s*/gi, "")
    .replace(/\bOur\s+most\s+popular\s+tour\s+with\s+/gi, "Includes ")
    .replace(/\bLimited\s+Permits\s+Available!?\s*/gi, "")
    .replace(/\bLimited\s+availability,?\s*reserve\s+early!?\s*/gi, "")
    .replace(/\bTop\s+Notch\s+Bear\s+Viewing!?\s*/gi, "")
    .replace(/\bBest\s+Choice\s*[-–—:]\s*/gi, "")
    .replace(/\bTrek\s+on\s+a\s+Glacier!?\s*/gi, "")
    .replace(/\bA\s+World\s+Class\s+([^!]+)!?/gi, "$1")
    .trim();
}

/**
 * Produces a concise, supported description for the widget without repeating
 * raw price/duration boilerplate or inventing unsupported/unattributed claims.
 */
export function formatWidgetDescription(
  tour: Pick<HelicopterTour, "title" | "description" | "category" | "port" | "company" | "pk"> | null | undefined,
): string {
  if (!tour) return "";

  const raw = stripUnattributedPromotionalClaims(cleanTourDescription(tour.description, ""));
  const parts = raw
    .split(/\s*(?:\||•)\s*/)
    .map((segment) => stripUnattributedPromotionalClaims(segment).trim())
    .filter(Boolean);

  const meaningfulParts: string[] = [];
  for (let part of parts) {
    part = part
      .replace(/\b(?:Starting at|From)\s+\$\s*[0-9,]+(?:\.[0-9]{2})?\s*(?:per\s+[a-z]+)?/gi, "")
      .replace(/^\$\s*[0-9,]+(?:\.[0-9]{2})?\s*(?:Per\s+[A-Za-z\s()/]+)?$/i, "")
      .replace(/^Book\s+Now\s+with\s+25%\s+Deposit$/i, "")
      .replace(/^Contact\s+for\s+pricing$/i, "")
      .trim();

    part = stripUnattributedPromotionalClaims(part);
    if (!part) continue;

    // Skip segments that are purely duration (already displayed as a dedicated badge)
    if (/^(\d+(?:\.\d+)?(?:\s*(?:-|–|to)\s*\d+(?:\.\d+)?)?)\s*(?:Hours?|Hrs?|Minutes?|Mins?)$/i.test(part)) {
      continue;
    }
    if (/^\d+\s*Hours?\s*(?:&|and)?\s*\d+\s*Minutes?$/i.test(part)) {
      continue;
    }

    // Normalize bare age shorthand like "10+" or "8+" into "Ages 10+"
    if (/^\d+\+$/.test(part)) {
      part = `Ages ${part}`;
    }

    meaningfulParts.push(part);
  }

  const joined = meaningfulParts.join(" · ").replace(/\s+/g, " ").trim();
  const oneLiner = getProductOneLiner(tour);

  if (!joined || joined.toLowerCase().includes("review the tour details")) {
    return oneLiner;
  }

  // If the remaining segments are only short metadata tags (like "Difficulty: Moderate · Ages 8+"),
  // prepend the factual excursion summary so the user sees both what the tour is and its supported details.
  if (joined.length < 48 && !joined.endsWith(".")) {
    return `${oneLiner} (${joined})`;
  }

  return joined.length > 200 ? `${joined.slice(0, 197).trimEnd()}...` : joined;
}

export function buildWidgetBookingUrl(options: {
  baseUrl?: string;
  company: string;
  pk: number | string;
  slug?: string;
  port?: string;
  placement?: string;
  widgetId?: string;
  context?: WidgetInitContext;
}): string {
  const company = encodeURIComponent(String(options.company || "").trim().toLowerCase());
  const pk = encodeURIComponent(String(options.pk || "").trim());
  const path = `/tours/${company}/${pk}/calendar`;

  const params = new URLSearchParams();
  const safePlacement = sanitizePlacementLabel(
    options.placement || options.context?.widgetPlacement,
  );
  const resolvedWidgetId =
    options.widgetId ||
    options.context?.widgetId ||
    `wta-${options.company}-${options.pk}`;
  const source = options.context?.source || "widget";

  const mergedContext: WidgetInitContext = {
    ...options.context,
    source,
    portSlug: options.context?.portSlug || options.port || undefined,
    productSlug: options.context?.productSlug || options.slug || String(options.pk),
    embedDomain: sanitizeEmbedDomain(options.context?.embedDomain),
    // Never collect or forward full host-page paths or query strings from third-party widget embeds
    embedPath: source === "dcc" ? options.context?.embedPath : undefined,
    widgetPlacement: safePlacement,
    widgetId: resolvedWidgetId,
  };

  appendWidgetContextToSearchParams(params, mergedContext);
  const query = params.toString();
  const relativeUrl = query ? `${path}?${query}` : path;

  if (!options.baseUrl) return relativeUrl;
  return `${options.baseUrl.replace(/\/$/, "")}${relativeUrl}`;
}

export function buildWidgetEmbedUrl(options: {
  baseUrl: string;
  company: string;
  pk: number | string;
  layout?: WidgetLayoutMode;
  accent?: string;
  placement?: string;
}): string {
  const base = options.baseUrl.replace(/\/$/, "");
  const company = encodeURIComponent(String(options.company).trim().toLowerCase());
  const pk = encodeURIComponent(String(options.pk).trim());
  const params = new URLSearchParams();

  const layout = sanitizeWidgetLayout(options.layout);
  if (layout !== "card") {
    params.set("layout", layout);
  }

  if (options.accent) {
    const theme = sanitizeAccentColor(options.accent);
    if (theme.hex !== DEFAULT_WIDGET_ACCENT) {
      params.set("accent", theme.hex.replace(/^#/, ""));
    }
  }

  const safePlacement = sanitizePlacementLabel(options.placement);
  if (safePlacement) {
    params.set("placement", safePlacement);
  }

  const query = params.toString();
  return query ? `${base}/widget/${company}/${pk}?${query}` : `${base}/widget/${company}/${pk}`;
}

function escapeHtmlAttr(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generates the standalone auto-resize <script> snippet.
 * Strictly validates:
 * 1. event.source === iframe.contentWindow (never matches by widgetKey alone)
 * 2. event.origin === expected origin parsed from the specific iframe's src
 * 3. height is a finite number within [120, 1600] px
 */
export function buildWidgetResizeScript(): string {
  return `<script>
(function(){if(window.__wtaWidgetResizeBound)return;window.__wtaWidgetResizeBound=true;window.addEventListener("message",function(e){if(!e||!e.source)return;var d=e.data;if(!d||d.type!=="wta-widget:resize"||typeof d.height!=="number"||!Number.isFinite(d.height))return;var h=Math.ceil(d.height);if(h<${WIDGET_MIN_HEIGHT_PX}||h>${WIDGET_MAX_HEIGHT_PX})return;var frames=document.querySelectorAll("iframe[data-wta-widget]");for(var i=0;i<frames.length;i++){var f=frames[i];if(f.contentWindow!==e.source)continue;try{var expectedOrigin=new URL(f.getAttribute("src")||f.src,window.location.href).origin;if(e.origin!==expectedOrigin)continue;}catch(_){continue;}f.style.height=h+"px";}});})();
</script>`;
}

/**
 * Generates a standalone <iframe> embed snippet WITHOUT any <script> tag.
 * Does not disable scrolling or clip overflow, ensuring the "Check dates & book" button
 * remains accessible even if the host CMS strips <script> tags, at narrow mobile widths,
 * or under increased browser text size.
 */
export function buildWidgetIframeOnlySnippet(options: {
  baseUrl: string;
  tour: Pick<HelicopterTour, "company" | "pk" | "title" | "port">;
  layout?: WidgetLayoutMode;
  accent?: string;
  placement?: string;
}): string {
  const layout = sanitizeWidgetLayout(options.layout);
  const embedUrl = buildWidgetEmbedUrl({
    baseUrl: options.baseUrl,
    company: options.tour.company,
    pk: options.tour.pk,
    layout,
    accent: options.accent,
    placement: options.placement,
  });

  const defaultHeight = layout === "compact" ? 260 : 500;
  const maxWidth = layout === "compact" ? "760px" : "420px";
  const widgetKey = `wta-${options.tour.company}-${options.tour.pk}`;
  const titleAttr = escapeHtmlAttr(`${options.tour.title} – Welcome to Alaska Tours`);

  return `<!-- Welcome to Alaska Tours Widget (Iframe Embed): ${escapeHtmlAttr(options.tour.title)} -->
<iframe
  src="${escapeHtmlAttr(embedUrl)}"
  title="${titleAttr}"
  data-wta-widget="${escapeHtmlAttr(widgetKey)}"
  loading="lazy"
  style="width:100%;max-width:${maxWidth};height:${defaultHeight}px;border:0;border-radius:16px;display:block;background:transparent;"
></iframe>`;
}

/**
 * Generates the <iframe> embed snippet plus the optional automatic resize <script>.
 */
export function buildWidgetIframeSnippet(options: {
  baseUrl: string;
  tour: Pick<HelicopterTour, "company" | "pk" | "title" | "port">;
  layout?: WidgetLayoutMode;
  accent?: string;
  placement?: string;
}): string {
  return `${buildWidgetIframeOnlySnippet(options)}
${buildWidgetResizeScript()}`;
}

/**
 * Generates a static HTML linked-card fallback for website builders that block <iframe> embeds.
 * Because copied static HTML cannot receive automatic catalog updates, it always displays
 * "Check current price" and omits volatile schedule, duration, or promotional claims.
 */
export function buildWidgetFallbackCardSnippet(options: {
  baseUrl: string;
  tour: HelicopterTour;
  layout?: WidgetLayoutMode;
  accent?: string;
  placement?: string;
}): string {
  const layout = sanitizeWidgetLayout(options.layout);
  const theme = sanitizeAccentColor(options.accent);
  const portLabel = getPortDisplayName(options.tour.port);
  const operatorLabel = getOperatorDisplayName(options.tour.company);
  const summary = getProductOneLiner(options.tour);

  const bookingUrl = buildWidgetBookingUrl({
    baseUrl: options.baseUrl,
    company: options.tour.company,
    pk: options.tour.pk,
    slug: options.tour.slug,
    port: options.tour.port,
    placement: options.placement,
  });

  const maxWidth = layout === "compact" ? "720px" : "400px";
  const metaLine = `${portLabel} · ${operatorLabel}`;

  const imageHtml = options.tour.image
    ? `<img src="${escapeHtmlAttr(options.tour.image)}" alt="${escapeHtmlAttr(options.tour.title)}" style="width:100%;height:190px;object-fit:cover;display:block;background:#e2e8f0;" loading="lazy" />`
    : `<div style="width:100%;height:140px;background:#f1f5f9;color:#475569;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;">${escapeHtmlAttr(portLabel)} Shore Excursion</div>`;

  return `<!-- Welcome to Alaska Tours Static Linked-Card Fallback (Static HTML — does not auto-update; live price & availability shown on booking page): ${escapeHtmlAttr(options.tour.title)} -->
<div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:${maxWidth};border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#ffffff;color:#0f172a;box-shadow:0 4px 14px rgba(15,23,42,0.06);line-height:1.45;">
  ${imageHtml}
  <div style="padding:18px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#475569;margin-bottom:6px;">${escapeHtmlAttr(metaLine)}</div>
    <div style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 8px 0;">${escapeHtmlAttr(options.tour.title)}</div>
    <div style="font-size:14px;color:#334155;margin:0 0 14px 0;">${escapeHtmlAttr(summary)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding-top:12px;border-top:1px solid #f1f5f9;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;">Check current price</div>
      <a href="${escapeHtmlAttr(bookingUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 16px;border-radius:10px;background:${theme.hex};color:${theme.textOnAccent};font-size:14px;font-weight:700;text-decoration:none;">Check dates &amp; book</a>
    </div>
  </div>
</div>`;
}
