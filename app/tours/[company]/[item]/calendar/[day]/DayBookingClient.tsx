"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import { parseWidgetInitContext } from "@/lib/widgetContext";

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
}: {
  company: string;
  item: string;
  day: string;
  initialSlots: Slot[];
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
        portSlug: widgetContext.portSlug || canonicalizePortSlug(inferPortFromCompany(company)) || undefined,
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

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-900">
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

        <div className="mt-6 grid gap-2">
          {slots.map((s) => (
            <button
              key={s.pk}
              onClick={() => {
                setSelected(s);
                setRatePk(null);
                setQty(1);
              }}
              className={[
                "rounded-2xl border px-4 py-3 text-left transition",
                selected?.pk === s.pk
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              ].join(" ")}
            >
              <div className="font-semibold">{fmtTime(s.start_at)}</div>
              <div className={selected?.pk === s.pk ? "text-xs text-white/80" : "text-xs text-slate-600"}>
                Capacity: {s.capacity ?? "?"}
              </div>
            </button>
          ))}
        </div>

        {!slots.length ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            No departures were returned for this date.
          </div>
        ) : null}

        {selected && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="font-semibold">Choose passenger type</div>

            <div className="mt-3 grid gap-2">
              {rates.map((r) => (
                <label
                  key={r.ratePk}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
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

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-sm text-slate-600">Qty</div>
              <input
                className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-2"
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
