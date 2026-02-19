"use client";

import FromPrice from "@/components/tours/FromPrice";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import ProductDepartureCalendar, {
  DepartureSelection,
} from "@/components/tours/ProductDepartureCalendar";
import ItemBookingPicker from "@/components/tours/ItemBookingPicker";
import { useCart } from "@/app/components/cart/CartContext";

function fmtCents(cents?: number) {
  if (!cents || !Number.isFinite(cents) || cents <= 0) return null;
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function TourDetailPage({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}) {
  const { company, item } = use(params) as { company: string; item: string };


const { addItem, setSelection, open } = useCart();

  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selection, setSelectionLocal] = useState<DepartureSelection | null>(null);

  // 1) Load tour snapshot
  useEffect(() => {
    async function loadTour() {
      try {
        const res = await fetch("/data/tours.json", { cache: "no-store" });
        const data = await res.json();

        const id = String(item);

        const found =
          data.find((t: any) => t.company === company && String(t.pk) === id) ||
          data.find((t: any) => t.company === company && t.slug === id);

        setTour(found || null);
      } catch (e) {
        console.error("Failed to load tour data", e);
        setTour(null);
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [company, item]);

  // Safe itemPk
  const itemPk: number | null = useMemo(() => {
    const raw = tour?.pk ?? tour?.fareharbor?.itemPk ?? null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [tour]);

  const heroSrc =
    tour?.image && String(tour.image).trim() !== "" ? tour.image : "/hero/hero5678.jpg";

  const selectedTimeLabel = useMemo(() => {
    if (!selection?.startAt) return null;
    // "2026-05-09T09:00:00-0800" -> "09:00"
    return String(selection.startAt).slice(11, 16) || null;
  }, [selection]);

  const priceLabel = useMemo(() => {
    const p = fmtCents(selection?.priceCents);
    if (p) return p;
    // fallback to snapshot "fromPrice" if you have it
    if (tour?.fromPrice) return String(tour.fromPrice);
    return null;
  }, [selection?.priceCents, tour?.fromPrice]);

  function addToItinerary() {
    if (!tour) return;
    if (!itemPk) {
      alert("This tour is missing an itemPk.");
      return;
    }
    if (!selection?.availabilityPk || !selection?.startAt || !selection?.ratePk || !selection?.qty) {
      alert("Pick a time first.");
      return;
    }

    const cartId = `${company}:${itemPk}`;

    addItem(
      {
        company,
        itemPk,
        title: tour.title || "Tour",
        headline: tour.headline || tour.shortDescription || "",
        image: heroSrc,
        supplierLabel: tour.supplierLabel || company,
        availabilityPk: selection.availabilityPk,
        startAt: selection.startAt,
        price: typeof selection.priceCents === "number" ? selection.priceCents : undefined,
        ratePk: selection.ratePk,
        rateLabel: selection.rateLabel,},
      1,
    );

    // keep selection+price synced on the stored item
    setSelection(cartId, {
      availabilityPk: selection.availabilityPk,
      startAt: selection.startAt,
      price: typeof selection.priceCents === "number" ? selection.priceCents : undefined,
        ratePk: selection.ratePk,
        rateLabel: selection.rateLabel,});

    open();
  }

  if (loading) {
    return (
      <div className="p-40 text-center font-black text-3xl sm:text-4xl lg:text-5xl font-black italic">LOADING DATA...</div>
    );
  }

  if (!tour || !itemPk) {
    return (
      <div className="p-40 text-center">
        <h1 className="text-2xl font-bold text-red-600 uppercase">Tour Data Not Found</h1>
        <p className="text-slate-500 mt-4">
          The snapshot file might be empty or this tour is missing an itemPk.
        </p>
        <Link
          href="/tours"
          className="mt-8 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl"
        >
          Back to All Tours
        </Link>
      </div>
    );
  }

  const canAdd = Boolean(selection?.availabilityPk && selection?.startAt);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative h-[40vh] bg-slate-900">
        <img
          src={heroSrc}
          className="h-full w-full object-cover opacity-80"
          alt={tour.title}
        />
        <div className="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
          <Link
            href="/tours"
            className="text-white bg-blue-600 px-4 py-1 rounded text-sm font-bold uppercase"
          >
            ← Back
          </Link>
          <h1 className="font-black text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 uppercase drop-shadow-md">
            {tour.title}
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-black mb-6 text-blue-900 uppercase">
            1. Pick a Date + Time
          </h2>

          <ProductDepartureCalendar
            company={company}
            itemPk={itemPk}
            selectedDay={selectedDay}
            setSelectedDay={(d) => {
              setSelectedDay(d);
              // changing day should reset time selection
              setSelectionLocal(null);
            }}
            onPickSelection={(sel) => {
              setSelectionLocal(sel);
            }}
          />
        </div>

        <div className="relative">
          <div className="sticky top-24 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 shadow-xl">
            <div className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">
              From
            </div>
            <div className="text-5xl font-black text-blue-600 mb-6">
<FromPrice company={tour.company} item={tour.itemPk ?? tour.item ?? tour.pk} initial={tour.fromPrice} />
            </div>

            <ItemBookingPicker
              selectedDay={selectedDay}
              selectedTimeLabel={selectedTimeLabel}
              priceLabel={priceLabel}
              canAdd={canAdd}
              onAdd={addToItinerary}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
