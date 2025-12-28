"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

/**
 * IMPORTANT:
 * PortMap MUST be defined at module scope.
 * SSR is disabled so it cannot force fullscreen.
 */
const PortMap = dynamic(
  () => import("../../components/PortMap.client.jsx"),
  { ssr: false }
);

/**
 * TEMP Juneau MVP tour data
 * (External booking for stability)
 */
const TOURS = {
  juneau: [
    {
      id: "juneau-whale",
      title: "Juneau Whale Watching",
      description: "Half-day wildlife cruise with guaranteed whale sightings.",
      booking_url:
        "https://fareharbor.com/embeds/book/harvandmarvs/items/?full-items=yes"
    },
    {
      id: "mendenhall-glacier",
      title: "Mendenhall Glacier Tour",
      description: "Guided visit to Alaska’s most famous glacier.",
      booking_url:
        "https://fareharbor.com/embeds/book/juneautours/items/?full-items=yes"
    }
  ]
};

export default function PortPage() {
  const { slug } = useParams();
  const port = slug?.toLowerCase();
  const tours = TOURS[port] || [];

  return (
    <main className="w-full bg-black text-cyan-300 font-mono flex flex-col">

      {/* ================= MAP SECTION (LOCKED HEIGHT) ================= */}
      <section className="relative w-full h-[40vh] flex-none overflow-hidden border-b border-cyan-800">

        {/* Map canvas */}
        <div className="absolute inset-0">
          <PortMap slug={port} />
        </div>

        {/* HUD overlay */}
        <div className="absolute top-4 left-4 z-10 bg-black/80 border border-cyan-500 p-4 rounded pointer-events-auto">
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
      </section>

      {/* ================= TOURS SECTION ================= */}
      <section className="relative z-10 w-full bg-black py-12">
        <div className="max-w-5xl mx-auto px-6">

          <h2 className="text-2xl font-bold mb-8">
            Available Tours
          </h2>

          {tours.length === 0 && (
            <p className="opacity-70">
              No tours configured for this port yet.
            </p>
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

              <a
                href={tour.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-cyan-700 text-black font-bold rounded hover:bg-cyan-500 transition"
              >
                Book Tour →
              </a>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
