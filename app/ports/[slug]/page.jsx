"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

/**
 * Map component (kept, but locked to container height)
 * NOT the focus right now.
 */
const PortMap = dynamic(
  () => import("../../components/PortMap.client.jsx"),
  { ssr: false }
);

/**
 * Coastal Helicopters — FareHarbor authoritative data
 */
const TOURS = {
  juneau: [
    {
      id: "glacier-heli",
      title: "Glacier Helicopter Tour",
      description: "Helicopter flight to the Juneau Icefield with glacier landing.",
      item_id: 413056
    },
    {
      id: "dog-sled",
      title: "Juneau Dog Sledding Tour",
      description: "Dog sledding adventure on a glacier via helicopter.",
      item_id: 413073
    },
    {
      id: "dog-sled-plus",
      title: "Dog Sled Tour + Glacier Landing",
      description: "Extended glacier experience with additional landing time.",
      item_id: 413093
    },
    {
      id: "private-heli",
      title: "Private Glacier Helicopter Tour",
      description: "Private helicopter tour to a remote glacier location.",
      item_id: 673459
    }
  ]
};

export default function PortPage() {
  const { slug } = useParams();
  const port = slug?.toLowerCase();
  const tours = TOURS[port] || [];

  return (
    <main className="w-full bg-black text-cyan-300 font-mono">

      {/* ================= MAP (LOCKED HEIGHT) ================= */}
      <section className="relative w-full h-[40vh] overflow-hidden border-b border-cyan-800">
        <div className="absolute inset-0">
          <PortMap slug={port} />
        </div>

        {/* HUD */}
        <div className="absolute top-4 left-4 z-10 bg-black/80 border border-cyan-600 p-4 rounded">
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

      {/* ================= TOURS (FAREHARBOR) ================= */}
      <section className="w-full py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">
            Available Tours
          </h2>

          {tours.map((tour) => (
            <div
              key={tour.id}
              className="border border-cyan-700 rounded-lg p-6 mb-6"
            >
              <h3 className="text-xl font-semibold mb-2">
                {tour.title}
              </h3>

              <p className="opacity-80 mb-4">
                {tour.description}
              </p>

              <a
                href={`https://fareharbor.com/embeds/book/coastalhelicopters/items/${tour.item_id}/calendar/`}
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
