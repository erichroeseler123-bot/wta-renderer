"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

/**
 * IMPORTANT:
 * Map MUST be client-only or it will break hydration
 */
const PortMap = dynamic(
  () => import("../../components/PortMap.client"),
  { ssr: false }
);

/**
 * TEMP Juneau MVP tour list
 * (Pure UI for now — booking wiring comes next)
 */
const TOURS = {
  juneau: [
    {
      id: "juneau-whale",
      title: "Juneau Whale Watching",
      description: "Half-day wildlife cruise with guaranteed whale sightings."
    },
    {
      id: "mendenhall-glacier",
      title: "Mendenhall Glacier Tour",
      description: "Guided visit to Alaska’s most famous glacier."
    }
  ]
};

export default function PortPage() {
  const { slug } = useParams();
  const port = slug?.toLowerCase();
  const tours = TOURS[port] || [];

  return (
    <main className="w-full bg-black text-cyan-300 font-mono">

{/* ================= MAP + HUD ================= */}
<div className="relative h-[40vh] w-full overflow-hidden">

  {/* 🔴 Map canvas MUST NOT receive pointer events */}
  <div className="absolute inset-0 pointer-events-none">
    <PortMap slug={port} />
  </div>

  {/* ✅ HUD can still receive clicks */}
  <div className="absolute top-4 left-4 pointer-events-auto bg-black/80 border border-cyan-500 p-4 rounded">
    <h1 className="text-lg font-bold uppercase">
      {port} Terminal
    </h1>
    <div className="text-sm opacity-80">
      58.3019° N, 134.4197° W
    </div>
    <div className="text-xs mt-1">
      STATUS: HUD ACTIVE
    </div>
  </div>

</div>

      {/* ================= AVAILABLE TOURS ================= */}
      <section className="relative z-20 bg-black py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">
            Available Tours
          </h2>

          {tours.length === 0 && (
            <div className="opacity-60">
              No tours configured for this port.
            </div>
          )}

          {tours.map((tour) => (
            <div
              key={tour.id}
              className="border border-cyan-700 rounded-lg p-6 mb-6 hover:border-cyan-400 transition"
            >
              <h3 className="text-xl font-semibold mb-2">
                {tour.title}
              </h3>

              <p className="opacity-80 mb-4">
                {tour.description}
              </p>

              {/* Button intentionally inert for now */}
              <button
                className="px-6 py-3 bg-cyan-700 text-black font-bold rounded hover:bg-cyan-500 transition"
                onClick={() => alert("Booking wiring comes next")}
              >
                Book Tour →
              </button>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
