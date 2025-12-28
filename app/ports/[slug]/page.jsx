"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

/**
 * IMPORTANT:
 * PortMap MUST be defined at module scope.
 * dynamic() still requires a symbol.
 */
const PortMap = dynamic(
  () => import("../../components/PortMap.client.jsx"),
  { ssr: false }
);

/**
 * TEMP Juneau MVP tour data
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
    <main className="w-full bg-black text-cyan-300 font-mono flex flex-col">

      {/* ================= MAP SECTION ================= */}
      <section className="relative w-full h-[40vh] flex-none overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <PortMap slug={port} />
        </div>

        {/* HUD */}
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
      </section>

      {/* ================= TOURS ================= */}
      <section className="relative z-10 w-full bg-black py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">
            Available Tours
          </h2>

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
