"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const pi = useMemo(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    return u.searchParams.get("payment_intent") || "";
  }, []);

  useEffect(() => {
    if (!pi) return;

    let stop = false;
    async function poll() {
      try {
        const r = await fetch(`/api/receipt?pi=${encodeURIComponent(pi)}`, { cache: "no-store" });
        const j = await r.json();
        if (stop) return;
        setData(j);
        if (j?.status === "pending") {
          setTimeout(poll, 1500);
        }
      } catch (e: any) {
        if (!stop) setErr(String(e?.message || e));
      }
    }
    poll();
    return () => {
      stop = true;
    };
  }, [pi]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-2">Payment received</h1>
      <p className="text-slate-600 mb-6">We’re confirming bookings now.</p>

      {!pi ? (
        <div className="text-red-600 font-semibold">Missing payment_intent in URL.</div>
      ) : null}

      {err ? <div className="text-red-600 font-semibold">{err}</div> : null}

      <div className="rounded-2xl border p-4 bg-white">
        <div className="text-xs text-slate-500 mb-2">PaymentIntent</div>
        <div className="font-mono text-sm break-all">{pi}</div>
        <div className="mt-3 font-bold">
          Status: <span className="uppercase">{data?.status || "pending"}</span>
        </div>
      </div>

      {data?.results?.length ? (
        <div className="mt-6 space-y-3">
          {data.results.map((r: any, idx: number) => (
            <div key={idx} className="rounded-2xl border p-4 bg-white">
              <div className="font-bold">
                {r?.line?.title || "Tour"} — qty {r?.line?.qty}
              </div>
              <div className="text-sm text-slate-600">
                {r?.line?.company} — {r?.line?.startAt || ""}
              </div>
              {r.ok ? (
                <div className="mt-2 text-green-700 font-semibold">
                  Booked ✓ {r?.booking?.display_id || r?.booking?.uuid || r?.booking?.pk || ""}
                </div>
              ) : (
                <div className="mt-2 text-red-700 font-semibold">
                  Failed ✕ {r?.error || "Booking failed"}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-slate-600">
          {data?.status === "pending" ? "Working…" : "No booking results yet."}
        </div>
      )}

      <div className="mt-8">
        <Link href="/tours" className="text-blue-700 font-bold">← Back to tours</Link>
      </div>
    </div>
  );
}
