import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWidgetBookingUrl,
  buildWidgetEmbedUrl,
  buildWidgetFallbackCardSnippet,
  buildWidgetIframeOnlySnippet,
  buildWidgetIframeSnippet,
  buildWidgetResizeScript,
  formatWidgetDescription,
  formatWidgetDuration,
  formatWidgetPrice,
  MAX_WIDGET_PRICE_AGE_MS,
  sanitizeAccentColor,
  sanitizePlacementLabel,
} from "@/lib/tourWidget";
import { getWidgetTourState } from "@/lib/helicopterTours";
import { buildOrderAttributionFromLines } from "@/lib/orders";
import { setTourCatalogOverride, setTourHidden } from "@/lib/visibilityStore";

test("formatWidgetPrice returns USD currency and basis for supported catalog prices and enforces freshness rule", () => {
  const nowMs = Date.parse("2026-10-25T12:00:00Z");
  const freshIso = new Date(nowMs - 2 * 24 * 60 * 60 * 1000).toISOString();
  const staleIso = new Date(nowMs - (MAX_WIDGET_PRICE_AGE_MS + 60_000)).toISOString();

  const flatRate = formatWidgetPrice(
    {
      company: "beyondak",
      pk: 195602,
      fromPrice: "$209 Per Person (Flat Rate)",
      priceUpdatedAt: freshIso,
      description: "Customer Favorite! From $209 per Person | Difficulty: Strenuous| 6 Hours | 10+",
    },
    { nowMs, requireFreshTimestamp: true },
  );
  assert.equal(flatRate.supported, true);
  assert.equal(flatRate.amountLabel, "$209");
  assert.equal(flatRate.currency, "USD");
  assert.equal(flatRate.basisLabel, "Per Person (Flat Rate)");

  // Stale price (>14 days old) falls back to "Check current price"
  const stalePrice = formatWidgetPrice(
    {
      company: "beyondak",
      pk: 195602,
      fromPrice: "$209 Per Person (Flat Rate)",
      priceUpdatedAt: staleIso,
      description: "Difficulty: Strenuous | 6 Hours | 10+",
    },
    { nowMs, requireFreshTimestamp: true },
  );
  assert.equal(stalePrice.supported, false);
  assert.equal(stalePrice.stale, true);
  assert.equal(stalePrice.amountLabel, "Check current price");

  // Missing timestamp when requireFreshTimestamp is true falls back to "Check current price"
  const missingTimestamp = formatWidgetPrice(
    {
      company: "beyondak",
      pk: 195602,
      fromPrice: "$209 Per Person (Flat Rate)",
      description: "Difficulty: Strenuous | 6 Hours | 10+",
    },
    { nowMs, requireFreshTimestamp: true },
  );
  assert.equal(missingTimestamp.supported, false);
  assert.equal(missingTimestamp.amountLabel, "Check current price");

  const privateCharter = formatWidgetPrice({
    company: "allenmarine",
    pk: 1001,
    fromPrice: "$1,800 Private Charter (Flat Rate)",
    description: "Private boat charter | 4 Hours",
  });
  assert.equal(privateCharter.supported, true);
  assert.equal(privateCharter.amountLabel, "$1,800");
  assert.equal(privateCharter.currency, "USD");
  assert.equal(privateCharter.basisLabel, "Private Charter (Flat Rate)");
});

test("formatWidgetPrice falls back to 'Check current price' for contact-only, deposit-only, or missing prices", () => {
  const contactOnly = formatWidgetPrice({
    company: "temscoair-juneau",
    pk: 285755,
    fromPrice: "Contact for pricing",
    description: "Private Helicopter Charter",
  });
  assert.equal(contactOnly.supported, false);
  assert.equal(contactOnly.amountLabel, "Check current price");
  assert.equal(contactOnly.currency, null);
  assert.equal(contactOnly.basisLabel, null);

  const depositOnly = formatWidgetPrice({
    company: "northstartrekking",
    pk: 115991,
    fromPrice: "$150 Per Person (Flat Rate)",
    description: "Book Now with 25% Deposit | 3.25 Hours | Minimum Age: 8",
  });
  assert.equal(depositOnly.supported, false);
  assert.equal(depositOnly.amountLabel, "Check current price");

  const missingPrice = formatWidgetPrice({
    company: "beyondak",
    pk: 123,
    fromPrice: "",
    description: "Guided tour",
  });
  assert.equal(missingPrice.supported, false);
  assert.equal(missingPrice.amountLabel, "Check current price");
});

test("formatWidgetDescription removes unattributed superlatives like 'Customer Favorite!'", () => {
  const desc1 = formatWidgetDescription({
    company: "beyondak",
    pk: 195602,
    title: "Mendenhall Glacier Guided Hike",
    port: "juneau",
    category: "Hiking & Glaciers",
    description: "Customer Favorite! From $209 per Person | Difficulty: Strenuous| 6 Hours | 10+",
  });
  assert.equal(/customer favorite/i.test(desc1), false);
  assert.match(desc1, /Difficulty: Strenuous/);
  assert.match(desc1, /Ages 10\+/);

  const desc2 = formatWidgetDescription({
    company: "beyondak",
    pk: 195597,
    title: "Mendenhall Glacier Ice Adventure Tour",
    port: "juneau",
    category: "Hiking & Glaciers",
    description: "Voted the Top 10 Tour in US! From $449 per Person | Difficulty: Easy to Moderate | 6 Hours | 8+",
  });
  assert.equal(/voted the top 10/i.test(desc2), false);

  const desc3 = formatWidgetDescription({
    company: "beyondak",
    pk: 195600,
    title: "Mendenhall Glacier Canoe Paddle & Hike",
    port: "juneau",
    category: "Hiking & Glaciers",
    description: "From $349 per Person | 5.5 Hours | Most Popular Tour to visit Mendenhall Glacier! | 12+",
  });
  assert.equal(/most popular tour/i.test(desc3), false);
});

test("formatWidgetDuration extracts only supported durations and never invents a fallback", () => {
  assert.equal(
    formatWidgetDuration({
      company: "beyondak",
      pk: 195602,
      title: "Mendenhall Glacier Guided Hike",
      description: "Customer Favorite! From $209 per Person | Difficulty: Strenuous| 6 Hours | 10+",
    }),
    "6 Hours",
  );

  assert.equal(
    formatWidgetDuration({
      company: "taquanair",
      pk: 392950,
      title: "Floatplane Bear Viewing",
      description: "Floatplane Bear Viewing • 3 Hours 15 Minutes • All Ages",
    }),
    "3 Hours 15 Minutes",
  );

  assert.equal(
    formatWidgetDuration({
      company: "beyondak",
      pk: 999,
      title: "Custom Excursion Without Duration",
      description: "Guided wilderness excursion in Juneau.",
    }),
    null,
  );
});

test("sanitizePlacementLabel normalizes valid labels and blocks credential or URL injection", () => {
  assert.equal(sanitizePlacementLabel("Hotel Homepage"), "hotel-homepage");
  assert.equal(sanitizePlacementLabel("partner_sidebar-2026!@#"), "partner_sidebar-2026");
  assert.equal(sanitizePlacementLabel("sk_live_123456789"), undefined);
  assert.equal(sanitizePlacementLabel("https://evil.example.com"), undefined);
  assert.equal(sanitizePlacementLabel("   "), undefined);
});

test("buildWidgetBookingUrl preserves tour routing and attribution while stripping external host paths and query strings", () => {
  const url = buildWidgetBookingUrl({
    baseUrl: "https://www.welcometoalaskatours.com",
    company: "beyondak",
    pk: 195602,
    slug: "mendenhall-glacier-guided-hike",
    port: "juneau",
    placement: "hotel-homepage",
    context: {
      embedDomain: "https://Partner-Hotel.example.com/private/room-booking?guestToken=secret123",
      embedPath: "/private/room-booking?guestToken=secret123",
    },
  });

  const parsed = new URL(url);
  assert.equal(parsed.origin, "https://www.welcometoalaskatours.com");
  assert.equal(parsed.pathname, "/tours/beyondak/195602/calendar");
  assert.equal(parsed.searchParams.get("source"), "widget");
  assert.equal(parsed.searchParams.get("widgetPlacement"), "hotel-homepage");
  assert.equal(parsed.searchParams.get("embedDomain"), "partner-hotel.example.com");
  assert.equal(parsed.searchParams.get("embedPath"), null);
  assert.equal(parsed.searchParams.get("portSlug"), "juneau");
  assert.equal(parsed.searchParams.get("productSlug"), "mendenhall-glacier-guided-hike");
});

test("buildOrderAttributionFromLines preserves multiple placements across a multi-item cart", () => {
  const attribution = buildOrderAttributionFromLines([
    {
      widgetPlacement: "hotel-homepage",
      widgetId: "wta-beyondak-195602",
      embedDomain: "https://insidepassagelodge.example.com/concierge?secret=1",
      portSlug: "juneau",
      productSlug: "mendenhall-glacier-guided-hike",
    },
    {
      widgetPlacement: "skagway-lodge-concierge",
      widgetId: "wta-temscoair-skagway-213556",
      embedDomain: "https://skagwayinn.example.com/excursions?token=2",
      portSlug: "skagway",
      productSlug: "helicopter-glacier-walkabout",
    },
  ]);

  assert.equal(attribution.handoffSource, "widget");
  assert.deepEqual(attribution.widgetPlacements, [
    "hotel-homepage",
    "skagway-lodge-concierge",
  ]);
  assert.equal(attribution.widgetPlacement, "hotel-homepage, skagway-lodge-concierge");
  assert.equal(
    attribution.embedDomain,
    "insidepassagelodge.example.com, skagwayinn.example.com",
  );
  assert.equal(attribution.embedPath, undefined);
});

test("getWidgetTourState reflects runtime visibility and catalog overrides and restores cleanly", async () => {
  const { setDurableKVOverrideForTests } = await import("../lib/kv");
  const store = new Map<string, unknown>();
  setDurableKVOverrideForTests({
    async get<T = unknown>(k: string) {
      return (store.get(k) as T) ?? null;
    },
    async set(k: string, v: unknown) {
      store.set(k, v);
    },
    async del(k: string) {
      store.delete(k);
    },
  });

  try {
    const initial = await getWidgetTourState("beyondak", "195602");
    assert.equal(initial.status, "active");
    assert.equal(initial.tour?.title, "Mendenhall Glacier Guided Hike");

    // 1. Authorized runtime catalog override updates the tour price/title immediately
    await setTourCatalogOverride("beyondak:195602", {
      fromPrice: "$225 Per Person (Flat Rate)",
      priceUpdatedAt: new Date().toISOString(),
    });
    const updated = await getWidgetTourState("beyondak", "195602");
    assert.equal(updated.status, "active");
    assert.equal(updated.tour?.fromPrice, "$225 Per Person (Flat Rate)");

    // 2. Authorized runtime visibility toggle marks the tour retired/unavailable immediately
    await setTourHidden("beyondak:195602", true);
    const hidden = await getWidgetTourState("beyondak", "195602");
    assert.equal(hidden.status, "retired");

    // 3. Restore original state
    await setTourHidden("beyondak:195602", false);
    await setTourCatalogOverride("beyondak:195602", null);
    const restored = await getWidgetTourState("beyondak", "195602");
    assert.equal(restored.status, "active");
    assert.equal(restored.tour?.fromPrice, "$209 Per Person (Flat Rate)");

    // Non-existent tour
    const missing = await getWidgetTourState("beyondak", "99999999");
    assert.equal(missing.status, "not_found");
    assert.equal(missing.tour, null);
  } finally {
    setDurableKVOverrideForTests(null);
  }
});

test("resize script validates origin, source, and bounds, and static fallback omits volatile claims", () => {
  const sampleTour = {
    pk: 195602,
    slug: "mendenhall-glacier-guided-hike",
    title: "Mendenhall Glacier Guided Hike",
    description: "Customer Favorite! From $209 per Person | Difficulty: Strenuous| 6 Hours | 10+",
    image: "https://cdn.filestackcontent.com/CT2dtoRkRU2deQYYVMz8",
    company: "beyondak",
    port: "juneau",
    fromPrice: "$209 Per Person (Flat Rate)",
    category: "Hiking & Glaciers",
  };

  const iframeOnly = buildWidgetIframeOnlySnippet({
    baseUrl: "https://www.welcometoalaskatours.com",
    tour: sampleTour,
    layout: "card",
    accent: "#0369a1",
    placement: "hotel-homepage",
  });
  assert.equal(iframeOnly.includes("<script"), false);
  assert.equal(iframeOnly.includes('scrolling="no"'), false);
  assert.equal(iframeOnly.includes("overflow:hidden"), false);

  const resizeScript = buildWidgetResizeScript();
  assert.match(resizeScript, /f\.contentWindow!==e\.source/);
  assert.match(resizeScript, /e\.origin!==expectedOrigin/);
  assert.match(resizeScript, /Number\.isFinite\(d\.height\)/);
  assert.equal(resizeScript.includes("d.widgetKey"), false);

  const iframeCode = buildWidgetIframeSnippet({
    baseUrl: "https://www.welcometoalaskatours.com",
    tour: sampleTour,
    layout: "compact",
    accent: "#0369a1",
    placement: "hotel-homepage",
  });
  assert.match(iframeCode, /<iframe/);
  assert.match(
    iframeCode,
    /https:\/\/www\.welcometoalaskatours\.com\/widget\/beyondak\/195602\?layout=compact&amp;accent=0369a1&amp;placement=hotel-homepage/,
  );

  const fallbackCode = buildWidgetFallbackCardSnippet({
    baseUrl: "https://www.welcometoalaskatours.com",
    tour: sampleTour,
    layout: "card",
    accent: "#0369a1",
    placement: "hotel-homepage",
  });

  assert.match(fallbackCode, /target="_blank" rel="noopener noreferrer"/);
  assert.match(fallbackCode, /Check current price/);
  assert.match(fallbackCode, /Check dates &amp; book/);
  assert.match(fallbackCode, /widgetPlacement=hotel-homepage/);
  assert.equal(fallbackCode.includes("$209"), false);
  assert.equal(fallbackCode.includes("6 Hours"), false);
  assert.equal(/customer favorite/i.test(fallbackCode), false);

  const theme = sanitizeAccentColor("#0369a1");
  assert.equal(theme.hex, "#0369a1");
  assert.equal(theme.textOnAccent, "#ffffff");
  assert.ok(
    buildWidgetEmbedUrl({
      baseUrl: "https://www.welcometoalaskatours.com",
      company: "beyondak",
      pk: 195602,
    }).endsWith("/widget/beyondak/195602"),
  );
});
