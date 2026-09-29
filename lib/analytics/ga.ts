"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __wta_ga_queue?: Array<{ eventName: string; params: Record<string, unknown> }>;
  }
}

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.NEXT_PUBLIC_GA4_ID ||
  "";

function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.search.includes("debug_ga=true");
}

export function sendGAEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const eventPayload: Record<string, unknown> = {
    ...params,
    site: "Welcome to Alaska Tours",
    host: window.location.hostname,
  };

  if (isDebugMode()) {
    eventPayload.debug_mode = true;
  }

  // If window.gtag is available, send directly
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, eventPayload);
      return;
    } catch (e) {
      console.warn("[GA4] Error dispatching event:", e);
    }
  }

  // Queue safely if gtag is not yet initialized
  if (!window.__wta_ga_queue) {
    window.__wta_ga_queue = [];
  }
  window.__wta_ga_queue.push({ eventName, params: eventPayload });
}

export function flushGAQueue() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const queue = window.__wta_ga_queue || [];
  while (queue.length > 0) {
    const item = queue.shift();
    if (item) {
      try {
        window.gtag("event", item.eventName, item.params);
      } catch (e) {
        console.warn("[GA4] Error flushing queued event:", e);
      }
    }
  }
}

// 1. Tour Views (view_item)
export function trackTourView(tour: {
  company: string;
  itemPk: number | string;
  title: string;
  category?: string;
  fromPrice?: string;
  port?: string;
}) {
  const priceNum = tour.fromPrice ? Number(String(tour.fromPrice).replace(/[^0-9.]/g, "")) : undefined;
  sendGAEvent("view_item", {
    currency: "USD",
    value: priceNum || undefined,
    items: [
      {
        item_id: `${tour.company}/${tour.itemPk}`,
        item_name: tour.title,
        item_category: tour.category || "Alaska Excursion",
        item_brand: tour.company,
        location_id: tour.port || undefined,
        price: priceNum || undefined,
      },
    ],
  });
}

// 2. Calendar Openings (view_item_list / calendar_open)
export function trackCalendarOpen(info: {
  company: string;
  itemPk: number | string;
  month?: string;
  port?: string;
}) {
  sendGAEvent("calendar_open", {
    company: info.company,
    item_id: `${info.company}/${info.itemPk}`,
    month: info.month,
    port: info.port,
  });
  sendGAEvent("view_item_list", {
    item_list_id: `calendar_${info.company}_${info.itemPk}`,
    item_list_name: `Availability Calendar - ${info.company} ${info.itemPk}`,
  });
}

// 3. Departure Selections (select_item & add_to_cart)
export function trackDepartureSelect(info: {
  company: string;
  itemPk: number | string;
  title?: string;
  availabilityPk?: number | string;
  day?: string;
  startAt: string;
  rateName?: string;
  rateLabel?: string;
  unitPriceDollars?: number;
  price?: number; // cents or dollars
  qty?: number;
  quantity?: number;
}) {
  const quantity = info.quantity ?? info.qty ?? 1;
  const rateLabel = info.rateLabel || info.rateName;
  let priceDollars = info.unitPriceDollars;
  if (priceDollars === undefined && typeof info.price === "number") {
    // If > 1000, likely cents
    priceDollars = info.price > 1000 ? info.price / 100 : info.price;
  }
  const lineValue = (priceDollars || 0) * quantity;
  const itemObj = {
    item_id: `${info.company}/${info.itemPk}`,
    item_name: info.title || `Tour ${info.itemPk}`,
    item_brand: info.company,
    item_variant: rateLabel || undefined,
    price: priceDollars || undefined,
    quantity,
    start_time: info.startAt,
    availability_id: info.availabilityPk ? String(info.availabilityPk) : undefined,
  };

  sendGAEvent("select_item", {
    item_list_name: "Tour Departures",
    items: [itemObj],
  });

  sendGAEvent("add_to_cart", {
    currency: "USD",
    value: lineValue > 0 ? lineValue : undefined,
    items: [itemObj],
  });
}

// 4. Checkout Starts (begin_checkout)
export function trackCheckoutStart(info: {
  valueDollars?: number;
  value?: number;
  itemCount?: number;
  items?: Array<{
    company?: string;
    itemPk?: number | string;
    title?: string;
    rateName?: string;
    priceCents?: number;
    price?: number;
    qty?: number;
    quantity?: number;
  }>;
}) {
  const totalVal = info.valueDollars ?? info.value;
  const items = (info.items || []).map((it) => ({
    item_id: it.itemPk ? `${it.company || "wta"}/${it.itemPk}` : undefined,
    item_name: it.title || "Tour Excursion",
    item_brand: it.company || "Welcome to Alaska Tours",
    item_variant: it.rateName || undefined,
    price: it.priceCents ? it.priceCents / 100 : it.price,
    quantity: it.quantity ?? it.qty ?? 1,
  }));

  sendGAEvent("begin_checkout", {
    currency: "USD",
    value: totalVal !== undefined && totalVal > 0 ? totalVal : undefined,
    items: items.length > 0 ? items : undefined,
  });
}

// 5. Operator Handoffs (operator_handoff)
export function trackOperatorHandoff(info: {
  operator?: string;
  company?: string;
  handoffId?: string;
  itemId?: string | number;
  itemPk?: string | number;
  targetUrl?: string;
  destination?: string;
  source?: string;
  port?: string;
  lane?: string;
}) {
  sendGAEvent("operator_handoff", {
    operator: info.operator || info.company || "operator",
    handoff_id: info.handoffId,
    item_id: info.itemId ? String(info.itemId) : info.itemPk ? String(info.itemPk) : undefined,
    target_url: info.targetUrl || info.destination,
    handoff_source: info.source,
    port: info.port,
    lane: info.lane,
  });
}

// 6. Verified Completed Purchases (purchase)
export function trackPurchase(info: {
  transactionId?: string;
  orderId?: string;
  valueDollars?: number;
  value?: number;
  currency?: string;
  items?: Array<{
    title?: string;
    item_name?: string;
    company?: string;
    item_brand?: string;
    itemPk?: number | string;
    item_id?: number | string;
    qty?: number;
    quantity?: number;
    priceDollars?: number;
    price?: number;
  }>;
}): boolean {
  if (typeof window === "undefined") return false;
  const orderId = info.transactionId || info.orderId;
  if (!orderId) return false;

  const dedupKey = `wta_ga_purchase_${orderId}`;
  try {
    if (sessionStorage.getItem(dedupKey)) {
      return false; // Already reported
    }
    sessionStorage.setItem(dedupKey, new Date().toISOString());
  } catch {
    // If sessionStorage is disabled, proceed
  }

  const totalValue = info.valueDollars ?? info.value ?? 0;
  const items = (info.items || []).map((it) => ({
    item_id: it.itemPk ? `${it.company || "unknown"}/${it.itemPk}` : it.item_id ? String(it.item_id) : orderId,
    item_name: it.item_name || it.title || "Tour Excursion",
    item_brand: it.item_brand || it.company || "Welcome to Alaska Tours",
    price: it.priceDollars ?? it.price ?? undefined,
    quantity: it.quantity ?? it.qty ?? 1,
  }));

  sendGAEvent("purchase", {
    transaction_id: orderId,
    value: totalValue,
    currency: info.currency || "USD",
    items: items.length > 0 ? items : undefined,
  });

  return true;
}
