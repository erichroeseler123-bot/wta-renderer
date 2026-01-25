"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCart } from "@/app/lib/cart";
import CartDrawer from "@/app/components/CartDrawer";

export default function PortPage() {
  const { slug } = useParams();
  const company = "bodyglove"; // FareHarbor DEMO company
  const { addItem, items } = useCart();

  const [open, setOpen] = useState(false);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fareharbor/items?company=${company}`)
      .then((r) => r.json())
      .then((d) => {
        setTours(d.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [company]);

  return (
    <main className="min-h-screen bg-black text-cyan-300 font-mono">

      {/* ================= TOP HUD ================= */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-cyan-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wide">
              {slug} Terminal
            </h1>
            <p className="text-xs text-cyan-500">
              Demo API Feed · FareHarbor Sandbox
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="border border-cyan-600 px-4 py-2 rounded
                       hover:bg-cyan-900 transition"
          >
            Cart ({items.length})
          </button>
        </div>
      </header>

      {/* ================= HERO STRIP ================= */}
      <section className="relative border-b border-cyan-900 bg-gradient-to-r from-black via-cyan-900/40 to-black">
        <div className="absolute inset-0 opacity-20
          bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.35),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold uppercase mb-2">
              Available Experiences
            </h2>
            <p className="text-sm text-cyan-400">
              Live demo inventory pulled from FareHarbor’s test environment.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TOUR GRID ================= */}
{/* ================= TOUR GRID ================= */}
<section className="relative max-w-7xl mx-auto px-6 py-16">

  {/* Section frame */}
  <div className="absolute inset-0 border border-cyan-900 rounded-xl pointer-events-none" />
  <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 to-black rounded-xl" />

  <div className="relative">
    <h3 className="text-sm uppercase tracking-widest text-cyan-500 mb-6">
      Live Inventory
    </h3>

    {loading && (
      <div className="text-center text-cyan-500 py-20">
        Loading inventory…
      </div>
    )}

    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, i) => (
        <div
          key={i}
          className="
            relative
            rounded-lg
            bg-black
            border border-cyan-800
            overflow-hidden
            shadow-[0_0_40px_rgba(0,255,255,0.08)]
          "
        >
          {/* Card HUD */}
          <div className="px-4 py-2 text-xs uppercase tracking-widest text-cyan-400 bg-cyan-950/40 border-b border-cyan-800">
            Experience
          </div>

          {/* Card body */}
          <div className="p-5 space-y-3">
            <h4 className="text-lg font-bold leading-tight">
              {tour.name}
            </h4>

            {tour.duration && (
              <div className="text-xs text-cyan-500">
                Duration · {tour.duration}
              </div>
            )}

            {tour.headline && (
              <p className="text-sm text-cyan-300/80">
                {tour.headline}
              </p>
            )}
          </div>

          {/* Card footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-cyan-800 bg-cyan-950/20">
            <div className="text-xl font-black">
              ${(tour.priceFrom / 100).toFixed(2)}
            </div>

            <button
              onClick={() =>
                addItem({
                  id: `${company}-${tour.name}`,
                  title: tour.name,
                  price: tour.priceFrom,
                  company,
                })
              }
              className="
                bg-cyan-500
                text-black
                font-bold
                px-4 py-2
                rounded
                hover:bg-cyan-400
                transition
              "
            >
              Add to Cart →
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ================= CART DRAWER ================= */}
      <CartDrawer open={open} onClose={() => setOpen(false)} />

    </main>
  );
}
