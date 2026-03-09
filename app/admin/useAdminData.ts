"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type TourRow = { key: string; itemPk: number; itemName: string; hidden: number };
export type Provider = { company: string; companyName?: string; hidden: number; tours: TourRow[] };

export type RecoveryOrder = {
  order_id: string;
  payment_intent_id?: string;
  status: string;
  contact?: { name?: string; email?: string };
  totalCents?: number;
  currency?: string;
  bookingAttempts?: number;
  updatedAt?: string;
  lastError?: string;
  attribution?: {
    handoffSource?: string;
    handoffId?: string;
    authorityTopic?: string;
    referrerPath?: string;
    portSlug?: string;
    category?: string;
    date?: string;
    partySize?: number;
    cruiseShip?: string;
    cruiseShipSlug?: string;
  };
};

export type HandoffDebugRow = {
  handoffId: string;
  source: string;
  version: string;
  sourceMode: "id" | "payload";
  targetUrl: string;
  intent?: {
    destination?: { portSlug?: string };
    bookingIntent?: { category?: string; date?: string; itemSlug?: string };
    traveler?: { partySize?: number; cruiseDate?: string; cruiseShipSlug?: string };
    context?: { referrerPath?: string; authorityTopic?: string; campaign?: string };
  };
  receivedAt: string;
  ip?: string;
  userAgent?: string;
};

export function useAdminData() {
  const [authed, setAuthed] = useState(false);
  const [bookingsEnabled, setBookingsEnabled] = useState<number>(0);
  const [msg, setMsg] = useState<string>("");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [recoveryOrders, setRecoveryOrders] = useState<RecoveryOrder[]>([]);
  const [handoffRows, setHandoffRows] = useState<HandoffDebugRow[]>([]);

  const totals = useMemo(() => ({
    providers: providers.length,
    tours: providers.reduce((n, p) => n + p.tours.length, 0),
  }), [providers]);

  const refreshFlags = useCallback(async () => {
    const r = await fetch("/api/admin/flags");
    const j = await r.json().catch(() => ({}));
    if (j?.success) {
      setAuthed(true);
      setBookingsEnabled(j.bookingsEnabled ?? 0);
    } else {
      setAuthed(false);
    }
  }, []);

  const refreshTours = useCallback(async () => {
    const r = await fetch("/api/admin/tours");
    const j = await r.json().catch(() => ({}));
    if (j?.success) setProviders(j.providers || []);
  }, []);

  const refreshRecovery = useCallback(async () => {
    const r = await fetch("/api/admin/orders?limit=100");
    const j = await r.json().catch(() => ({}));
    if (j?.success) setRecoveryOrders(j.orders || []);
  }, []);

  const refreshHandoffs = useCallback(async () => {
    const r = await fetch("/api/handoff/dcc/debug?limit=50");
    const j = await r.json().catch(() => ({}));
    if (j?.success) setHandoffRows(j.rows || []);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void refreshFlags().then(async () => {
        await Promise.all([refreshTours(), refreshRecovery(), refreshHandoffs()]);
      });
    }, 0);

    return () => window.clearTimeout(t);
  }, [refreshFlags, refreshHandoffs, refreshRecovery, refreshTours]);

  const login = useCallback(async (password: string) => {
    setMsg("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j?.success) {
      setMsg(j?.error || "Login failed");
      return false;
    }
    await refreshFlags();
    await Promise.all([refreshTours(), refreshRecovery(), refreshHandoffs()]);
    return true;
  }, [refreshFlags, refreshHandoffs, refreshRecovery, refreshTours]);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setMsg("Logged out");
  }, []);

  const setBookings = useCallback(async (enabled: boolean) => {
    setMsg("");
    const r = await fetch("/api/admin/flags", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bookingsEnabled: enabled }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j?.success) return setMsg(j?.error || "Update failed");
    setBookingsEnabled(j.bookingsEnabled ?? 0);
    setMsg(enabled ? "Bookings ENABLED" : "Bookings DISABLED");
  }, []);

  const setProviderHidden = useCallback(async (company: string, hidden: boolean) => {
    setMsg("");
    setProviders(prev => prev.map(p => p.company === company ? { ...p, hidden: hidden ? 1 : 0 } : p));

    const r = await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ company, hidden }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j?.success) {
      setProviders(prev => prev.map(p => p.company === company ? { ...p, hidden: hidden ? 0 : 1 } : p));
      setMsg(j?.error || "Provider update failed");
    }
  }, []);

  const setTourHidden = useCallback(async (key: string, hidden: boolean) => {
    setMsg("");
    setProviders(prev => prev.map(p => ({
      ...p,
      tours: p.tours.map(t => t.key === key ? { ...t, hidden: hidden ? 1 : 0 } : t)
    })));

    const r = await fetch("/api/admin/visibility", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, hidden }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j?.success) {
      setProviders(prev => prev.map(p => ({
        ...p,
        tours: p.tours.map(t => t.key === key ? { ...t, hidden: hidden ? 0 : 1 } : t)
      })));
      setMsg(j?.error || "Tour update failed");
    }
  }, []);

  const setProviderAndAllTours = useCallback(async (company: string, hideAll: boolean) => {
    await setProviderHidden(company, hideAll);
    const p = providers.find(x => x.company === company);
    if (!p) return;
    for (const t of p.tours) {
      await setTourHidden(t.key, hideAll);
    }
  }, [providers, setProviderHidden, setTourHidden]);

  const retryOrderBooking = useCallback(async (order_id: string) => {
    setMsg("");
    const r = await fetch("/api/admin/orders/retry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order_id }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.success) {
      setMsg(j?.error || "Retry failed");
    } else {
      setMsg(`Retry completed: ${j?.status || "unknown"}`);
    }

    await refreshRecovery();
  }, [refreshRecovery]);

  return {
    authed, bookingsEnabled, providers, totals, msg, recoveryOrders, handoffRows,
    setMsg,
    login, logout,
    refreshFlags, refreshTours, refreshRecovery, refreshHandoffs,
    setBookings,
    setProviderHidden,
    setTourHidden,
    setProviderAndAllTours,
    retryOrderBooking,
  };
}
