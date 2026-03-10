"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/app/components/cart/CartContext";
import { inferPortFromCompany } from "@/lib/handoff/mappings";

type SlotRate = {
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

type Slot = {
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
  // "2026-05-01T07:45:00-0800" -> "07:45"
  return startAt.slice(11, 16);
}

export default function DayPage({
  params,
}: {
  params: { company: string; item: string; day: string };
}) {
  const { company, item, day } = params;
  const sp = useSearchParams();
  const { addItem, open } = useCart();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [ratePk, setRatePk] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    (async () => {
      const start = day;
      // end = next day
      const d = new Date(day + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + 1);
      const end = d.toISOString().slice(0, 10);

      const r = await fetch(
        `/api/fareharbor/calendar?company=${company}&item=${item}&start=${start}&end=${end}`,
        { cache: "no-store" },
      );
      const j = await r.json();
      const dayObj = (j.days ?? [])[0] as { slots?: Slot[] } | undefined;
      setSlots(dayObj?.slots ?? []);
    })();
  }, [company, item, day]);

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
        handoffId: sp.get("handoff_id") || sp.get("handoffId") || undefined,
        authorityTopic: sp.get("authority_topic") || sp.get("topic") || undefined,
        referrerPath: sp.get("referrer_path") || sp.get("referrerPath") || undefined,
        handoffCategory: sp.get("category") || undefined,
        handoffDate: sp.get("date") || day || undefined,
        partySize: Number(sp.get("partySize") || 0) || undefined,
        adults: Number(sp.get("adults") || 0) || undefined,
        children: Number(sp.get("children") || 0) || undefined,
        cruiseShip: sp.get("cruiseShip") || undefined,
        cruiseShipSlug: sp.get("cruiseShipSlug") || undefined,
        timeOfDay: sp.get("timeOfDay") || undefined,
        budgetTier: sp.get("budgetTier") || undefined,
        portSlug: inferPortFromCompany(company) || undefined,
      },
      safeQty,
    );

    open();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="text-white/70 text-sm">
        {company} / {item}
      </div>
      <h1 className="mt-2 text-2xl font-semibold">{day}</h1>

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
                ? "border-white/30 bg-white/10"
                : "border-white/10 bg-white/5 hover:bg-white/10",
            ].join(" ")}
          >
            <div className="font-semibold">{fmtTime(s.start_at)}</div>
            <div className="text-xs text-white/70">
              Capacity: {s.capacity ?? "?"}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="font-semibold">Choose passenger type</div>

          <div className="mt-3 grid gap-2">
            {rates.map((r) => (
              <label
                key={r.ratePk}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-white/70">{r.note}</div>
                  <div className="text-xs text-white/50">
                    Cap: {r.cap ?? "?"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-white/80">
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

          <div className="mt-4 flex items-center gap-3">
            <div className="text-sm text-white/70">Qty</div>
            <input
              className="w-20 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
            <button
              onClick={addToCart}
              disabled={!ratePk}
              className="ml-auto rounded-2xl bg-white/15 px-4 py-2 font-semibold hover:bg-white/20 disabled:opacity-40"
            >
              Add to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
