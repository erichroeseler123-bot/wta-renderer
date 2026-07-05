"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CRUISE_SHIPS } from "@/lib/cruiseShips";

export default function HomepageForm({
  approvedPorts,
}: {
  approvedPorts: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [port, setPort] = useState(approvedPorts[0]?.slug || "juneau");
  const [ship, setShip] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams();
    qs.set("port", port);
    if (ship) qs.set("cruiseShip", ship);
    if (date) qs.set("date", date);
    qs.set("intent", "best-for");
    qs.set("topic", "shore-excursions");

    router.push(`/plan?${qs.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 max-w-xl mx-auto">
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Port */}
        <div className="space-y-1.5">
          <label htmlFor="port-select" className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Port
          </label>
          <select
            id="port-select"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {approvedPorts.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Ship */}
        <div className="space-y-1.5">
          <label htmlFor="ship-select" className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Cruise Ship
          </label>
          <select
            id="ship-select"
            value={ship}
            onChange={(e) => setShip(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Select ship...</option>
            {CRUISE_SHIPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="date-input" className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            Port Date
          </label>
          <input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 py-3.5 text-center text-sm font-black text-white hover:bg-slate-800 transition"
      >
        Find Matching Excursions
      </button>
    </form>
  );
}
