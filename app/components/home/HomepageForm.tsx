"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRUISE_SHIPS } from "@/lib/cruiseShips";

const TRIP_STYLES = [
  { value: "best-overall", label: "Best overall", hint: "Start with the strongest all-around choices" },
  { value: "wildlife-whales", label: "Wildlife & whales", hint: "Whales, bears, rainforest and wildlife" },
  { value: "glaciers", label: "Glaciers", hint: "Glacier views, walks, paddles and icefields" },
  { value: "flightseeing", label: "Flightseeing", hint: "Helicopters, seaplanes and aerial scenery" },
  { value: "dog-sledding", label: "Dog sledding", hint: "Huskies, glacier camps and sled experiences" },
  { value: "fishing", label: "Fishing", hint: "Salmon, halibut and private charters" },
  { value: "adventure", label: "Adventure", hint: "Kayaks, Jeeps, UTVs, ziplines and active days" },
  { value: "easy-day", label: "Easy day", hint: "Simpler pacing and lower-friction logistics" },
  { value: "private-premium", label: "Private / premium", hint: "Private charters and bigger splurge experiences" },
];

export default function HomepageForm({
  approvedPorts,
}: {
  approvedPorts: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [port, setPort] = useState(approvedPorts[0]?.slug || "juneau");
  const [style, setStyle] = useState("best-overall");
  const [ship, setShip] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    qs.set("port", port);
    qs.set("topic", style);
    qs.set("intent", "best-for");
    qs.set("sourcePage", "/");
    if (ship) qs.set("cruiseShip", ship);
    if (date) qs.set("date", date);
    if (style === "easy-day") qs.set("mobility", "easy");
    if (style === "private-premium") qs.set("budget", "premium");

    router.push(`/plan?${qs.toString()}`);
  };

  const inputClass =
    "w-full rounded-2xl border border-[#0b352f]/10 bg-[#f5f2e9] px-4 py-3.5 text-sm font-black text-[#082522] outline-none transition focus:border-[#0b352f]/30 focus:bg-white focus:ring-4 focus:ring-[#d7ff76]/35";

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[2.25rem] border border-white/40 bg-[#fffdf8]/96 p-5 text-[#082522] shadow-[0_30px_100px_rgba(0,0,0,.28)] backdrop-blur-xl sm:p-6"
    >
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#d7ff76]/45 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#53726d]">Build your port day</div>
            <h2 className="mt-2 text-3xl font-black leading-none tracking-[-0.04em] text-[#082522]">What sounds good?</h2>
          </div>
          <div className="hidden rounded-full bg-[#d7ff76] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#163a34] sm:block">
            4-choice shortlist
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="port-select" className="block text-[10px] font-black uppercase tracking-[0.17em] text-[#5d7773]">
              01 · Where are you stopping?
            </label>
            <select id="port-select" value={port} onChange={(e) => setPort(e.target.value)} className={inputClass}>
              {approvedPorts.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="style-select" className="block text-[10px] font-black uppercase tracking-[0.17em] text-[#5d7773]">
              02 · What kind of day?
            </label>
            <select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
              {TRIP_STYLES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 rounded-2xl bg-[#e8f2ee] px-4 py-3 text-xs font-semibold leading-5 text-[#496762]">
          {TRIP_STYLES.find((item) => item.value === style)?.hint}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="ship-select" className="block text-[10px] font-black uppercase tracking-[0.17em] text-[#5d7773]">
              Cruise ship <span className="font-semibold normal-case tracking-normal text-[#82938f]">optional</span>
            </label>
            <select id="ship-select" value={ship} onChange={(e) => setShip(e.target.value)} className={inputClass}>
              <option value="">Choose later</option>
              {CRUISE_SHIPS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="date-input" className="block text-[10px] font-black uppercase tracking-[0.17em] text-[#5d7773]">
              Port date <span className="font-semibold normal-case tracking-normal text-[#82938f]">optional</span>
            </label>
            <input id="date-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#082522] px-5 text-left text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(8,37,34,.18)] transition hover:-translate-y-0.5 hover:bg-[#123a35]"
        >
          <span>Show my 4 best choices</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d7ff76] text-base text-[#082522]">→</span>
        </button>

        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold leading-5 text-[#6c817d]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#8ebc3d]" />
          Live calendar stays the source for current departures, price and capacity.
        </div>
      </div>
    </form>
  );
}
