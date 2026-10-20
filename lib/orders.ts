import { getKV } from "@/lib/kv";

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_INDEX = 300;

export type OrderStatus =
  | "payment_pending"
  | "paid"
  | "booking_pending"
  | "booked"
  | "booking_failed"
  | "cancelled"
  | "refund_pending"
  | "partially_refunded"
  | "refunded";

export type OrderLine = {
  company: string;
  itemPk: number;
  availabilityPk: number;
  ratePk: number;
  qty: number;
  title?: string;
  startAt?: string;
  lineTotalCents: number;
  currency: string;
  handoffSource?: string;
  handoffId?: string;
  sourceSlug?: string;
  sourcePage?: string;
  topicSlug?: string;
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  productSlug?: string;
  category?: string;
  handoffDate?: string;
  dccReturnUrl?: string;
  embedDomain?: string;
  embedPath?: string;
  widgetPlacement?: string;
  widgetId?: string;
  partySize?: number;
  adults?: number;
  children?: number;
  cruiseShip?: string;
  cruiseShipSlug?: string;
  timeOfDay?: string;
  budgetTier?: string;
};

export type OrderAttribution = {
  handoffSource?: string;
  handoffId?: string;
  sourceSlug?: string;
  sourcePage?: string;
  topicSlug?: string;
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  productSlug?: string;
  category?: string;
  date?: string;
  dccReturnUrl?: string;
  embedDomain?: string;
  embedPath?: string;
  widgetPlacement?: string;
  widgetId?: string;
  partySize?: number;
  adults?: number;
  children?: number;
  cruiseShip?: string;
  cruiseShipSlug?: string;
  timeOfDay?: string;
  budgetTier?: string;
};

export type OrderSnapshot = {
  order_id: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  cart_id: string;
  payment_intent_id?: string;
  contact: { name: string; email: string; phone: string };
  items: OrderLine[];
  totalCents: number;
  currency: string;
  attribution?: OrderAttribution;
  status: OrderStatus;
  bookingAttempts: number;
  lastError?: string;
  bookingResults?: Array<Record<string, unknown>>;
  confirmationEmailSentAt?: string;
  confirmationEmailProvider?: string;
  confirmationEmailId?: string;
  confirmationEmailError?: string;
  refundId?: string;
  refundAmountCents?: number;
  refundStatus?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancel_token?: string;
  client_secret_hash?: string;
};

function nowIso() {
  return new Date().toISOString();
}

async function readIndex(key: string): Promise<string[]> {
  const kv = await getKV();
  if (!kv) return [];
  const list = (await kv.get<string[]>(key)) || [];
  return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
}

async function writeIndex(key: string, values: string[]) {
  const kv = await getKV();
  if (!kv) throw new Error("KV not configured");
  await kv.set(key, values.slice(0, MAX_INDEX), { ex: ORDER_TTL_SECONDS });
}

export async function saveOrder(order: OrderSnapshot) {
  const kv = await getKV();
  if (!kv) throw new Error("KV not configured");

  const updated: OrderSnapshot = {
    ...order,
    updatedAt: nowIso(),
  };

  await kv.set(`order:${updated.order_id}`, updated, { ex: ORDER_TTL_SECONDS });

  if (updated.payment_intent_id) {
    await kv.set(`pi:${updated.payment_intent_id}`, { order_id: updated.order_id }, { ex: ORDER_TTL_SECONDS });
  }

  const recent = await readIndex("orders:recent");
  const deduped = [updated.order_id, ...recent.filter((x) => x !== updated.order_id)];
  await writeIndex("orders:recent", deduped);

  const needsAttention = await readIndex("orders:needs_attention");
  const has = needsAttention.includes(updated.order_id);
  const shouldInclude =
    updated.status === "booking_failed" ||
    (Boolean(updated.lastError) && (updated.status === "cancelled" || updated.status === "refund_pending"));

  if (shouldInclude && !has) {
    await writeIndex("orders:needs_attention", [updated.order_id, ...needsAttention]);
  } else if (!shouldInclude && has) {
    await writeIndex(
      "orders:needs_attention",
      needsAttention.filter((x) => x !== updated.order_id),
    );
  }

  if (updated.payment_intent_id) {
    await kv.set(
      `receipt:${updated.payment_intent_id}`,
      {
        status: updated.status,
        order_id: updated.order_id,
        cart_id: updated.cart_id,
        payment_intent_id: updated.payment_intent_id,
        totalCents: updated.totalCents,
        currency: updated.currency,
        contact: updated.contact,
        attribution: updated.attribution || null,
        results: updated.bookingResults || [],
        lastError: updated.lastError || null,
        confirmationEmailSentAt: updated.confirmationEmailSentAt || null,
        confirmationEmailProvider: updated.confirmationEmailProvider || null,
        confirmationEmailId: updated.confirmationEmailId || null,
        confirmationEmailError: updated.confirmationEmailError || null,
        cancel_token: updated.cancel_token || null,
        client_secret_hash: updated.client_secret_hash || null,
        updatedAt: updated.updatedAt,
      },
      { ex: ORDER_TTL_SECONDS },
    );
  }

  return updated;
}

export async function getOrder(orderId: string) {
  const kv = await getKV();
  if (!kv) return null;
  return (await kv.get<OrderSnapshot>(`order:${orderId}`)) || null;
}

export async function getOrderByPaymentIntent(paymentIntentId: string) {
  const kv = await getKV();
  if (!kv) return null;

  const map = await kv.get<{ order_id?: string }>(`pi:${paymentIntentId}`);
  const orderId = String(map?.order_id || "");
  if (!orderId) return null;

  return getOrder(orderId);
}

export async function listOrdersNeedingAttention(limit = 50) {
  const ids = await readIndex("orders:needs_attention");
  const out: OrderSnapshot[] = [];

  for (const id of ids.slice(0, Math.max(1, limit))) {
    const order = await getOrder(id);
    if (order) out.push(order);
  }

  return out;
}

export async function listRecentOrders(limit = 50) {
  const ids = await readIndex("orders:recent");
  const out: OrderSnapshot[] = [];

  for (const id of ids.slice(0, Math.max(1, limit))) {
    const order = await getOrder(id);
    if (order) out.push(order);
  }

  return out;
}

export async function acquireOrderLock(orderId: string, ttlSeconds = 120) {
  const kv = await getKV();
  if (!kv) return false;
  const lockKey = `lock:order:${orderId}`;
  const locked = await kv.set(lockKey, nowIso(), { nx: true, ex: ttlSeconds });
  return locked === "OK";
}

export async function releaseOrderLock(orderId: string) {
  const kv = await getKV();
  if (!kv) return;
  await kv.del(`lock:order:${orderId}`);
}

import crypto from "crypto";

export function makeOrderCancelToken(orderId: string, email?: string): string {
  const secret = process.env.ORDER_SIGNING_SECRET || "";
  const randomSalt = crypto.randomBytes(16).toString("hex");
  if (secret) {
    const sig = crypto.createHmac("sha256", secret).update(`${orderId}:${(email || "").toLowerCase().trim()}:${randomSalt}`).digest("hex");
    return `${randomSalt}.${sig}`;
  }
  return crypto.randomBytes(24).toString("hex");
}

export function verifyOrderCancelToken(order: OrderSnapshot, providedToken: string): boolean {
  if (!providedToken || typeof providedToken !== "string") return false;
  const token = providedToken.trim();
  if (order.cancel_token && order.cancel_token === token) return true;

  const secret = process.env.ORDER_SIGNING_SECRET || "";
  if (secret && token.includes(".")) {
    const [salt, sig] = token.split(".");
    if (salt && sig) {
      const expected = crypto.createHmac("sha256", secret).update(`${order.order_id}:${(order.contact?.email || "").toLowerCase().trim()}:${salt}`).digest("hex");
      if (expected === sig) return true;
    }
  }
  return false;
}

export function hashClientSecret(clientSecret: string): string {
  return crypto.createHash("sha256").update(String(clientSecret || "").trim()).digest("hex");
}

export function verifyClientSecret(providedSecret: string, storedHash?: string | null): boolean {
  if (!providedSecret || !storedHash) return false;
  const providedHash = hashClientSecret(providedSecret);
  if (providedHash.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(storedHash));
  } catch {
    return false;
  }
}

export { ORDER_TTL_SECONDS };
