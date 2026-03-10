"use client";

import { useMemo, useState } from "react";

type AdminOrder = {
  order_id: string;
  status: string;
  createdAt?: string;
  paidAt?: string;
  totalCents?: number;
  currency?: string;
  payment_intent_id?: string;
  bookingResults?: Array<Record<string, unknown>>;
  confirmationEmailSentAt?: string;
  confirmationEmailError?: string;
  lastError?: string;
  stripeData?: {
    status: string;
    amount: number;
    currency: string;
    created: string;
    last4: string | null;
    customerId: string | null;
    dashboardPaymentUrl: string;
    dashboardCustomerUrl: string | null;
  } | null;
};

function fmtDate(v?: string) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

function statusClass(status: string) {
  if (status === "booked") return "bg-emerald-100 text-emerald-800";
  if (status === "booking_failed") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export default function AdminOrdersPage() {
  const [secret, setSecret] = useState("");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [stripeLookupError, setStripeLookupError] = useState<string | null>(null);

  const totalLabel = useMemo(() => `${orders.length} order${orders.length === 1 ? "" : "s"}`, [orders.length]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: "50", scope: "recent" });
      if (secret.trim()) qs.set("secret", secret.trim());
      const r = await fetch(`/api/admin/orders?${qs.toString()}`, { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) {
        throw new Error(j?.error || "Failed to load orders");
      }
      setOrders(Array.isArray(j.orders) ? (j.orders as AdminOrder[]) : []);
      setStripeLookupError(typeof j.stripeLookupError === "string" ? j.stripeLookupError : null);
      setLoaded(true);
    } catch (e: unknown) {
      setOrders([]);
      setStripeLookupError(null);
      setLoaded(true);
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-slate-900">
      <h1 className="text-3xl font-black tracking-tight">Recent Orders</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read-only operations view for booking status, payment intent, and confirmation outcomes.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="text-sm font-semibold text-slate-700">
            Admin Secret (optional if already logged in)
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="WTA_ADMIN_SECRET"
            />
          </label>
          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="min-h-11 self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load Recent Orders"}
          </button>
        </div>
      </div>

      {error ? <div className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Error: {error}</div> : null}
      {stripeLookupError ? (
        <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
          Stripe lookup warning: {stripeLookupError}
        </div>
      ) : null}
      {loaded && !error ? <div className="mt-4 text-sm font-semibold text-slate-600">{totalLabel}</div> : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-3 text-left">Order ID</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Created</th>
              <th className="px-3 py-3 text-left">Total</th>
              <th className="px-3 py-3 text-left">Payment Intent</th>
              <th className="px-3 py-3 text-left">Stripe</th>
              <th className="px-3 py-3 text-left">Email Sent</th>
              <th className="px-3 py-3 text-left">Booking Results</th>
              <th className="px-3 py-3 text-left">Error</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.order_id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-3 font-mono text-xs">{order.order_id}</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {typeof order.totalCents === "number"
                    ? `$${(order.totalCents / 100).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-3 py-3 font-mono text-xs">{order.payment_intent_id || "—"}</td>
                <td className="px-3 py-3">
                  {order.stripeData ? (
                    <div className="space-y-1">
                      <div>
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {order.stripeData.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">
                        {order.stripeData.currency} {order.stripeData.amount.toFixed(2)}
                        {order.stripeData.last4 ? ` • **** ${order.stripeData.last4}` : ""}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <a
                          href={order.stripeData.dashboardPaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Payment
                        </a>
                        {order.stripeData.dashboardCustomerUrl ? (
                          <a
                            href={order.stripeData.dashboardCustomerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            Customer
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {order.confirmationEmailSentAt ? fmtDate(order.confirmationEmailSentAt) : "—"}
                  {order.confirmationEmailError ? (
                    <div className="mt-1 text-xs text-rose-700">{order.confirmationEmailError}</div>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  {Array.isArray(order.bookingResults) ? order.bookingResults.length : 0}
                </td>
                <td className="px-3 py-3 text-rose-700">{order.lastError || "—"}</td>
              </tr>
            ))}
            {loaded && orders.length < 1 ? (
              <tr>
                <td className="px-3 py-6 text-slate-500" colSpan={9}>
                  No recent orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
