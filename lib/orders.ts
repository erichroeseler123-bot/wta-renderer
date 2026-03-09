import { getKV } from "@/lib/kv";

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_INDEX = 300;

export type OrderStatus =
  | "payment_pending"
  | "paid"
  | "booking_pending"
  | "booked"
  | "booking_failed";

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
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  category?: string;
  handoffDate?: string;
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
  authorityTopic?: string;
  referrerPath?: string;
  portSlug?: string;
  category?: string;
  date?: string;
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
  const shouldInclude = updated.status === "booking_failed";

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

export { ORDER_TTL_SECONDS };
