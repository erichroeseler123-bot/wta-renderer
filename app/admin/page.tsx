"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useAdminData } from "./useAdminData";

const AdminDashboard = dynamic(() => import("./AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
      Loading admin…
    </div>
  ),
});

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const {
    authed,
    bookingsEnabled,
    providers,
    recoveryOrders,
    handoffRows,
    dccCallbackRows,
    dccProbeRunning,
    dccProbeResult,
    msg,
    login,
    logout,
    setBookings,
    setProviderHidden,
    setTourHidden,
    setProviderAndAllTours,
    retryOrderBooking,
    refreshHandoffs,
    refreshDccCallbacks,
    runDccProbe,
  } = useAdminData();

  return (
    <div className="mx-auto max-w-5xl p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">WTA Admin</h1>
          <Link
            href="/admin/widgets"
            className="rounded-xl bg-sky-500/20 border border-sky-400/40 hover:bg-sky-500/30 px-3.5 py-1.5 text-xs font-semibold text-sky-200"
          >
            Tour Widget Builder &rarr;
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-xl bg-white/10 hover:bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white/80"
          >
            Orders
          </Link>
        </div>
        {authed ? (
          <button
            onClick={logout}
            className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
          >
            Logout
          </button>
        ) : null}
      </div>

      {!authed ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 max-w-xl">
          <div className="text-sm text-white/70">Owner login</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2"
            placeholder="Admin password"
          />
          <button
            onClick={() => login(password).then((ok) => ok && setPassword(""))}
            className="mt-3 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2"
          >
            Login
          </button>
          {msg ? <div className="mt-3 text-sm text-white/70">{msg}</div> : null}
        </div>
      ) : (
        <AdminDashboard
          bookingsEnabled={bookingsEnabled}
          providers={providers}
          recoveryOrders={recoveryOrders}
          handoffRows={handoffRows}
          dccCallbackRows={dccCallbackRows}
          dccProbeRunning={dccProbeRunning}
          dccProbeResult={dccProbeResult}
          msg={msg}
          onToggleBookings={(enabled) => setBookings(enabled)}
          onProviderHidden={(company, hidden) => setProviderHidden(company, hidden)}
          onTourHidden={(key, hidden) => setTourHidden(key, hidden)}
          onHideAll={(company, hideAll) => setProviderAndAllTours(company, hideAll)}
          onRetryOrderBooking={(orderId) => retryOrderBooking(orderId)}
          onRefreshHandoffs={() => refreshHandoffs()}
          onRefreshDccCallbacks={() => refreshDccCallbacks()}
          onRunDccProbe={() => runDccProbe()}
        />
      )}
    </div>
  );
}
