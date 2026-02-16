"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart, groupBySupplier } from "../components/cart/CartContext";

type Pick = { availabilityPk: number; startAt: string; price?: number };

function ymdUTC(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtTime(iso: string) {
  // best-effort formatting
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeAvail(a: any): Pick | null {
  const pk = a?.availability_pk ?? a?.availabilityPk ?? a?.pk ?? a?.id ?? null;

  const startAt =
    a?.start_at ??
    a?.startAt ??
    a?.start_time ??
    a?.startTime ??
    a?.start ??
    null;

  if (!pk || !startAt) return null;

  const price =
    a?.customer_prototal ??
    a?.customer_pro_total ??
    a?.price ??
    a?.retail_price ??
    a?.customer_price ??
    undefined;

  return {
    availabilityPk: Number(pk),
    startAt: String(startAt),
    price: typeof price === "number" ? price : undefined,
  };
}

async function fetchAvailabilities(
  company: string,
  itemPk: number,
  start: string,
  end: string,
) {
  const url = `/api/fareharbor/availabilities?company=${encodeURIComponent(company)}&item=${encodeURIComponent(String(itemPk))}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();
  if (!j?.ok) throw new Error(j?.error || "Failed to load availabilities");
  const raw = Array.isArray(j.availabilities) ? j.availabilities : [];
  return raw.map(normalizeAvail).filter(Boolean) as Pick[];
}

export default function CheckoutPage() {
  const { items, clear, setSelection } = useCart();

  // next 21 days window (easy + fast)
  const { start, end } = useMemo(() => {
    const s = new Date();
    const e = new Date();
    e.setDate(e.getDate() + 21);
    // use UTC dates (matches your route helpers)
    const sY = ymdUTC(
      new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())),
    );
    const eY = ymdUTC(
      new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())),
    );
    return { start: sY, end: eY };
  }, []);

  const groups = useMemo(() => groupBySupplier(items), [items]);

  // cache per item id
  const [avMap, setAvMap] = useState<
    Record<string, { loading: boolean; err?: string; list: Pick[] }>
  >({});

  useEffect(() => {
    let alive = true;

    async function run() {
      for (const it of items) {
        if (!it.company || !it.itemPk) continue;
        if (avMap[it.id]?.list?.length || avMap[it.id]?.loading) continue;

        setAvMap((m) => ({ ...m, [it.id]: { loading: true, list: [] } }));
        try {
          const list = await fetchAvailabilities(
            it.company,
            it.itemPk,
            start,
            end,
          );
          if (!alive) return;
          setAvMap((m) => ({ ...m, [it.id]: { loading: false, list } }));
        } catch (e: any) {
          if (!alive) return;
          setAvMap((m) => ({
            ...m,
            [it.id]: { loading: false, list: [], err: e?.message || String(e) },
          }));
        }
      }
    }

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, start, end]);

  const missingSelections = items.filter(
    (it) => !it.availabilityPk || !it.startAt,
  );
  const canPayBook = items.length > 0 && missingSelections.length === 0;

  return (
    <main className="container-pad py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2">Checkout</h1>
          <p className="p mt-2">
            We&#39;ll take payment, then book instantly via FareHarbor API.
            First, pick a departure time for each tour.
          </p>
        </div>

        <Link className="btn" href="/tours">
          Back to Tours
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card card-pad mt-8">
          <div className="text-white font-semibold">No items yet.</div>
          <div className="mt-2 text-white/60">
            Add tours from the Tours page to build your itinerary.
          </div>
          <Link className="btn btn-primary mt-4" href="/tours">
            Browse Tours →
          </Link>
        </div>
      ) : (
        <>
          {!canPayBook ? (
            <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
              <div className="font-semibold">Action required</div>
              <div className="text-sm text-amber-100/80">
                Select a departure time for{" "}
                <span className="font-semibold">
                  {missingSelections.length}
                </span>{" "}
                item(s) below to enable Pay &amp; Book.
              </div>
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            {groups.map((g) => (
              <section key={g.supplier} className="card card-pad">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-white font-semibold">{g.supplier}</div>
                    <div className="text-xs text-white/60">
                      Operator checkout happens automatically after payment
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      // quick collapse behavior is via cart drawer; keep simple here
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Review
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  {g.items.map((it) => {
                    const st = avMap[it.id];
                    const selected = it.availabilityPk && it.startAt;

                    return (
                      <div
                        key={it.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-white">
                              {it.title}
                            </div>
                            <div className="text-xs text-white/60">
                              Qty {it.qty}
                              {it.startAt ? ` · ${fmtTime(it.startAt)}` : ""}
                            </div>
                          </div>

                          <div className="min-w-[260px]">
                            {st?.loading ? (
                              <div className="text-sm text-white/60">
                                Loading times…
                              </div>
                            ) : st?.err ? (
                              <div className="text-sm text-rose-200">
                                Failed to load times:{" "}
                                <span className="text-rose-200/80">
                                  {st.err}
                                </span>
                              </div>
                            ) : (
                              <label className="block">
                                <div className="text-xs text-white/60 mb-1">
                                  Departure time
                                </div>
                                <select
                                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white"
                                  value={
                                    selected
                                      ? `${it.availabilityPk}|${it.startAt}`
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (!v) return;
                                    const [pkStr, startAt] = v.split("|");
                                    const pk = Number(pkStr);
                                    const picked = st?.list.find(
                                      (x) =>
                                        x.availabilityPk === pk &&
                                        x.startAt === startAt,
                                    );
                                    setSelection(it.id, {
                                      availabilityPk: pk,
                                      startAt,
                                      price: picked?.price,
                                    });
                                  }}
                                >
                                  <option value="">Select a time…</option>
                                  {(st?.list || []).slice(0, 80).map((a) => (
                                    <option
                                      key={`${a.availabilityPk}|${a.startAt}`}
                                      value={`${a.availabilityPk}|${a.startAt}`}
                                    >
                                      {fmtTime(a.startAt)}
                                      {typeof a.price === "number"
                                        ? ` · $${a.price.toFixed(2)}`
                                        : ""}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            )}
                          </div>
                        </div>

                        {!selected ? (
                          <div className="mt-3 text-xs text-amber-100/80">
                            Select a departure time to book this tour.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="btn" onClick={clear}>
              Clear itinerary
            </button>

            <button
              type="button"
              className={`btn btn-primary ${!canPayBook ? "opacity-40 pointer-events-none" : ""}`}
              onClick={() => {
                // Next step: payment + booking endpoint
                alert(
                  "Next: wire Stripe payment, then call FareHarbor booking API server-side.",
                );
              }}
            >
              Pay &amp; Book →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
