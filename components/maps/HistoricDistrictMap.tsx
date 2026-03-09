"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-3xl border border-white/10 bg-white/5" />
  ),
});

export default function HistoricDistrictMap({
  lat,
  lon,
  title = "Historic District Map",
}: {
  lat: number;
  lon: number;
  title?: string;
}) {
  const [interactive, setInteractive] = useState(false);

  const staticUrl = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY!;
    const style = "streets-v2";
    const zoom = 15;
    const bearing = -25;
    const pitch = 50;
    const w = 1200;
    const h = 700;
    return `https://api.maptiler.com/maps/${style}/static/${lon},${lat},${zoom},${bearing},${pitch}/${w}x${h}.png?key=${key}`;
  }, [lat, lon]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white/90">{title}</h3>
        {!interactive && (
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            Open interactive map
          </button>
        )}
      </div>

      {!interactive ? (
        // Static map loads instantly, no JS map bundle
        <img
          src={staticUrl}
          alt={title}
          loading="lazy"
          className="h-[420px] w-full rounded-2xl object-cover"
        />
      ) : (
        <InteractiveMap lat={lat} lon={lon} />
      )}
    </section>
  );
}
