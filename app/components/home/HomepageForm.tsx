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

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl sm:p-6 max-w-3xl mx-auto">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="port-select" className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            1. Where is your ship stopping?
          </label>
          <select
            id="port-select"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            {approvedPorts.map((p) => (
              <option key={p.slug} value={p.slug}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="style-select" className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            2. What kind of Alaska day?
          </label>
          <select
            id="style-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            {TRIP_STYLES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500">{TRIP_STYLES.find((item) => item.value === style)?.hint}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ship-select" className="text-xs font-black uppercase tracking-wider text-slate-500 block">Cruise ship <span className="font-medium normal-case tracking-normal">(optional)</span></label>
          <select
            id="ship-select"
            value={ship}
            onChange={(e) => setShip(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            <option value="">Choose later</option>
            {CRUISE_SHIPS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="date-input" className="text-xs font-black uppercase tracking-wider text-slate-500 block">Port date <span className="font-medium normal-case tracking-normal">(optional)</span></label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </div>
      </div>

      <button type="submit" className="mt-5 w-full rounded-2xl bg-slate-950 py-4 text-center text-sm font-black uppercase tracking-wider text-white hover:bg-slate-800 transition">
        Show my 4 best choices →
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">We shortlist from the connected Alaska excursion catalog. Open a tour calendar to confirm current departures, pricing and capacity.</p>
    </form>
  );
}
