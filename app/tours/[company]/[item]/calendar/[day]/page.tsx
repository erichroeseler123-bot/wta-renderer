"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [slots, setSlots] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
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
      const dayObj = (j.days ?? [])[0];
      setSlots(dayObj?.slots ?? []);
    })();
  }, [company, item, day]);

  const rates = useMemo(() => {
    if (!selected?.customer_type_rates) return [];
    return selected.customer_type_rates.map((r: any) => ({
      ratePk: r.pk,
      name: r.customer_type?.singular,
      note: r.customer_type?.note,
      cap: r.capacity,
      price: r.customer_prototype?.total,
    }));
  }, [selected]);

  function addToCart() {
    if (!selected || !ratePk) return;

    // TODO: replace with your real CartContext action
    console.log("ADD_TO_CART", {
      company,
      item: Number(item),
      availability_pk: selected.pk,
      start_at: selected.start_at,
      rate_pk: ratePk,
      qty,
    });

    alert("Added (wire into CartContext next)");
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
            {rates.map((r: any) => (
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
                    ${(r.price / 100).toFixed(0)}
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
