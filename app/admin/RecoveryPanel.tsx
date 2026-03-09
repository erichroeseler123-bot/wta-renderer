"use client";

import { useMemo, useState } from "react";
import type { RecoveryOrder } from "./useAdminData";

function money(cents?: number, currency = "usd") {
  const n = Number(cents || 0) / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(n);
}

export default function RecoveryPanel(props: {
  orders: RecoveryOrder[];
  onRetry: (orderId: string) => void;
}) {
  const { orders, onRetry } = props;
  const [sourceFilter, setSourceFilter] = useState("all");
  const [portFilter, setPortFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [shipFilter, setShipFilter] = useState("all");

  const sources = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((o) => o.attribution?.handoffSource || "")
            .filter((x) => x),
        ),
      ).sort(),
    [orders],
  );
  const ports = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((o) => o.attribution?.portSlug || "")
            .filter((x) => x),
        ),
      ).sort(),
    [orders],
  );
  const topics = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((o) => o.attribution?.authorityTopic || "")
            .filter((x) => x),
        ),
      ).sort(),
    [orders],
  );
  const ships = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((o) => o.attribution?.cruiseShip || o.attribution?.cruiseShipSlug || "")
            .filter((x) => x),
        ),
      ).sort(),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (sourceFilter !== "all" && (o.attribution?.handoffSource || "") !== sourceFilter) return false;
      if (portFilter !== "all" && (o.attribution?.portSlug || "") !== portFilter) return false;
      if (topicFilter !== "all" && (o.attribution?.authorityTopic || "") !== topicFilter) return false;
      if (shipFilter !== "all" && (o.attribution?.cruiseShip || o.attribution?.cruiseShipSlug || "") !== shipFilter) return false;
      return true;
    });
  }, [orders, portFilter, shipFilter, sourceFilter, topicFilter]);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-white/70">Recovery queue</div>
      <div className="text-lg font-semibold">Paid but unbooked orders: {filteredOrders.length}</div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-xl bg-black/30 border border-white/10 px-2 py-2">
          <option value="all">All sources</option>
          {sources.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={portFilter} onChange={(e) => setPortFilter(e.target.value)} className="rounded-xl bg-black/30 border border-white/10 px-2 py-2">
          <option value="all">All ports</option>
          {ports.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="rounded-xl bg-black/30 border border-white/10 px-2 py-2">
          <option value="all">All topics</option>
          {topics.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={shipFilter} onChange={(e) => setShipFilter(e.target.value)} className="rounded-xl bg-black/30 border border-white/10 px-2 py-2">
          <option value="all">All ships</option>
          {ships.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      {!filteredOrders.length ? (
        <div className="mt-3 text-sm text-white/60">No failed bookings in the current queue.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {filteredOrders.map((o) => (
            <div key={o.order_id} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-white/70">{o.order_id}</div>
                  <div className="text-sm text-white/80">{o.contact?.email || "unknown email"}</div>
                  <div className="text-xs text-white/60">
                    {o.status} • attempts: {o.bookingAttempts || 0} • {money(o.totalCents, o.currency || "usd")}
                  </div>
                  {o.lastError ? <div className="text-xs text-red-300 mt-1">{o.lastError}</div> : null}

                  {o.attribution ? (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wide text-white/65">
                      {o.attribution.handoffSource ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Source {o.attribution.handoffSource}</span>
                      ) : null}
                      {o.attribution.handoffId ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Handoff {o.attribution.handoffId}</span>
                      ) : null}
                      {o.attribution.authorityTopic ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Topic {o.attribution.authorityTopic}</span>
                      ) : null}
                      {o.attribution.portSlug ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Port {o.attribution.portSlug}</span>
                      ) : null}
                      {o.attribution.category ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Category {o.attribution.category}</span>
                      ) : null}
                      {o.attribution.date ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Date {o.attribution.date}</span>
                      ) : null}
                      {o.attribution.partySize ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Party {o.attribution.partySize}</span>
                      ) : null}
                      {o.attribution.cruiseShip ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Ship {o.attribution.cruiseShip}</span>
                      ) : null}
                      {!o.attribution.cruiseShip && o.attribution.cruiseShipSlug ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5">Ship {o.attribution.cruiseShipSlug}</span>
                      ) : null}
                      {o.attribution.referrerPath ? (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 normal-case">Ref {o.attribution.referrerPath}</span>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => onRetry(o.order_id)}
                  className="rounded-xl bg-amber-500/20 hover:bg-amber-500/30 px-3 py-2 text-xs"
                >
                  Retry booking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
