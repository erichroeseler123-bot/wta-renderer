"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import { parseWidgetInitContext } from "@/lib/widgetContext";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { evaluatePortDayFit } from "@/lib/timing";

export type SlotRate = {
  pk: number;
  customer_type?: {
    singular?: string;
    note?: string;
  };
  capacity?: number;
  customer_prototype?: {
    total?: number;
  };
};

export type Slot = {
  pk: number;
  start_at: string;
  startAt?: string;
  capacity?: number;
  customer_type_rates?: SlotRate[];
};

type PickerRate = {
  ratePk: number;
  name?: string;
  note?: string;
  cap?: number;
  price?: number;
};

function fmtTime(startAt: string) {
  return startAt.slice(11, 16);
}

export default function DayBookingClient({
  company,
  item,
  day,
  initialSlots,
  tourDurationMinutes,
}: {
  company: string;
  item: string;
  day: string;
  initialSlots: Slot[];
  tourDurationMinutes: number | null;
}) {
  const sp = useSearchParams();
  const { addItem, open } = useCart();
  const [slots] = useState<Slot[]>(initialSlots);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [ratePk, setRatePk] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const widgetContext = useMemo(() => parseWidgetInitContext(sp), [sp]);

  const rates = useMemo<PickerRate[]>(() => {
    if (!selected?.customer_type_rates) return [];
    return selected.customer_type_rates.map((r) => ({
      ratePk: r.pk,
      name: r.customer_type?.singular,
      note: r.customer_type?.note,
      cap: r.capacity,
      price: r.customer_prototype?.total,
    }));
  }, [selected]);

  const cruiseShip = sp.get("cruiseShip") || undefined;
  const hint = cruiseShip ? CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName] : undefined;
  const port = inferPortFromCompany(company, item);
  const matchedHint = hint && hint.portSlug === port ? hint : undefined;

  let shipArrival: string | undefined = undefined;
  let shipDeparture: string | undefined = undefined;
  let shipWindow: string | undefined = undefined;

  if (matchedHint) {
    const windowMatch = matchedHint.window.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
    if (windowMatch) {
      shipArrival = windowMatch[1];
      shipDeparture = windowMatch[2];
      shipWindow = matchedHint.window;
    }
  }

  function addToCart() {
    if (!selected || !ratePk) return;
    const chosenRate = rates.find((r) => Number(r.ratePk) === Number(ratePk));
    const safeQty = Math.max(1, Math.min(99, Math.floor(Number(qty) || 1)));
    const unitCents = Number(chosenRate?.price || 0) || undefined;

    addItem(
      {
        company,
        itemPk: Number(item),
        title: `Tour ${item}`,
        supplierLabel: company,
        day,
        availabilityPk: Number(selected.pk),
        startAt: String(selected.start_at || selected.startAt || ""),
        ratePk: Number(ratePk),
        rateLabel: chosenRate?.name ? String(chosenRate.name) : undefined,
        price: unitCents,
        handoffSource: sp.get("source") || sp.get("handoffSource") || undefined,
        handoffId: widgetContext.handoffId,
        sourceSlug: widgetContext.sourceSlug,
        sourcePage: sp.get("sourcePage") || widgetContext.sourcePage || undefined,
        topicSlug: widgetContext.topicSlug,
        authorityTopic: sp.get("authority_topic") || sp.get("topic") || undefined,
        referrerPath: sp.get("referrer_path") || sp.get("referrerPath") || undefined,
        handoffCategory: sp.get("category") || undefined,
        handoffDate: widgetContext.eventDate || sp.get("date") || day || undefined,
        dccReturnUrl: widgetContext.dccReturnUrl,
        partySize: Number(sp.get("partySize") || 0) || undefined,
        adults: Number(sp.get("adults") || 0) || undefined,
        children: Number(sp.get("children") || 0) || undefined,
        cruiseShip: sp.get("cruiseShip") || undefined,
        cruiseShipSlug: sp.get("cruiseShipSlug") || undefined,
        timeOfDay: sp.get("timeOfDay") || undefined,
        budgetTier: sp.get("budgetTier") || undefined,
        portSlug: widgetContext.portSlug || canonicalizePortSlug(inferPortFromCompany(company, item)) || undefined,
        productSlug: widgetContext.productSlug || undefined,
        requestedLane: sp.get("requestedLane") || undefined,
        resolvedLane: sp.get("resolvedLane") || sp.get("lane") || undefined,
        degradedFallback: sp.get("degradedFallback") === "true" ? true : sp.get("degradedFallback") === "false" ? false : undefined,
        embedDomain: widgetContext.embedDomain,
        embedPath: widgetContext.embedPath,
        widgetPlacement: widgetContext.widgetPlacement,
        widgetId: widgetContext.widgetId,
      },
      safeQty,
    );

    open();
  }

  const selectedEval = useMemo(() => {
    if (!selected) return null;
    const timeStr = selected.start_at.slice(11, 16);
    return evaluatePortDayFit({
      shipArrival,
      shipDeparture,
      tourStart: timeStr,
      durationMinutes: tourDurationMinutes,
    });
  }, [selected, shipArrival, shipDeparture, tourDurationMinutes]);

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href={`/tours/${company}/${item}/calendar`}
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Back to calendar
        </Link>

        <h1 className="mt-6 text-3xl font-black tracking-tight">{day}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a departure and passenger type, then add it to the cart.
        </p>

        {cruiseShip && shipWindow && (
          <div className="mt-4 p-4 rounded-xl border border-sky-100 bg-sky-50/50 text-sky-950 text-xs">
            <strong>Cruise Schedule:</strong> {cruiseShip} is in port from {shipWindow} (All-aboard is 30m before departure). Excursion timing fit checks are displayed below.
          </div>
        )}

        <div className="mt-6 grid gap-2">
          {slots.map((s) => {
            const timeStr = s.start_at.slice(11, 16);
            const evalResult = evaluatePortDayFit({
              shipArrival,
              shipDeparture,
              tourStart: timeStr,
              durationMinutes: tourDurationMinutes,
            });

            const badgeConfig = {
              safe: {
                selected: "bg-emerald-800 text-emerald-100 border-emerald-700",
                normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
                label: "✓ Safe return window",
              },
              tight: {
                selected: "bg-amber-800 text-amber-100 border-amber-700",
                normal: "bg-amber-100 text-amber-800 border-amber-200",
                label: "⚠️ Tight return window",
              },
              unsafe: {
                selected: "bg-rose-800 text-rose-100 border-rose-700",
                normal: "bg-rose-100 text-rose-800 border-rose-200",
                label: "✗ Timing warning",
              },
              unknown: {
                selected: "bg-slate-700 text-slate-200 border-slate-600",
                normal: "bg-slate-100 text-slate-600 border-slate-200",
                label: cruiseShip ? "Verify ship schedules" : "Check ship window",
              },
            }[evalResult.status];

            return (
              <button
                key={s.pk}
                onClick={() => {
                  setSelected(s);
                  setRatePk(null);
                  setQty(1);
                }}
                className={[
                  "rounded-2xl border px-4 py-3 text-left transition flex items-center justify-between gap-4",
                  selected?.pk === s.pk
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                ].join(" ")}
              >
                <div>
                  <div className="font-semibold">{fmtTime(s.start_at)}</div>
                  <div className={selected?.pk === s.pk ? "text-xs text-white/80" : "text-xs text-slate-600"}>
                    Capacity: {s.capacity ?? "?"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${selected?.pk === s.pk ? badgeConfig.selected : badgeConfig.normal}`}>
                    {badgeConfig.label}
                  </span>
                  {evalResult.status !== "unknown" && (
                    <span className={`text-[10px] ${selected?.pk === s.pk ? "text-white/60" : "text-slate-400"}`}>
                      {evalResult.status === "safe" || evalResult.status === "tight"
                        ? `${evalResult.bufferMinutes}m return buffer`
                        : "Tight/unsafe window"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!slots.length ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No departures were returned for this date.
          </div>
        ) : null}

        {selected && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            {selectedEval && selectedEval.status !== "unknown" && selectedEval.status !== "safe" && (
              <div className={`p-4 rounded-xl border text-xs leading-5 ${selectedEval.status === "unsafe" ? "bg-rose-50 border-rose-200 text-rose-950" : "bg-amber-50 border-amber-200 text-amber-950"}`}>
                <strong className="block uppercase tracking-wider text-[10px] font-black">
                  {selectedEval.status === "unsafe" ? "Warning: Excursion Timing Conflict" : "Notice: Tight transfer buffer"}
                </strong>
                <span className="block mt-1">{selectedEval.reason} Verify your ship's actual all-aboard time.</span>
              </div>
            )}

            <div>
              <div className="font-semibold">Choose passenger type</div>
              <div className="mt-3 grid gap-2">
                {rates.map((r) => (
                  <label
                    key={r.ratePk}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-xs text-slate-600">{r.note}</div>
                      <div className="text-xs text-slate-500">Cap: {r.cap ?? "?"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-slate-800">
                        ${((Number(r.price || 0)) / 100).toFixed(0)}
                      </div>
                      <input
                        type="radio"
                        name="rate"
                        checked={ratePk === r.ratePk}
                        onChange={() => setRatePk(r.ratePk)}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-sm text-slate-600">Qty</div>
              <input
                className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
              <button
                onClick={addToCart}
                disabled={!ratePk}
                className="rounded-2xl bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
              >
                Add to cart
              </button>
              <Link
                href="/checkout"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100"
              >
                Go to checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
