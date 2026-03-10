"use client";

import FromPrice from "@/components/tours/FromPrice";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import ProductDepartureCalendar, {
  DepartureSelection,
} from "@/components/tours/ProductDepartureCalendar";
import ItemBookingPicker from "@/components/tours/ItemBookingPicker";
import { useCart } from "@/app/components/cart/CartContext";
import { useCruise } from "@/context/CruiseContext";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import JsonLd from "@/components/seo/JsonLd";

type TourSnapshot = {
  pk?: number | string;
  company?: string;
  slug?: string;
  title?: string;
  headline?: string;
  shortDescription?: string;
  image?: string;
  supplierLabel?: string;
  fromPrice?: string;
  category?: string;
  itemPk?: number | string;
  item?: number | string;
  fareharbor?: { itemPk?: number | string };
};

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
  const sp = useSearchParams();
  const { ship: cruiseShip, date: cruiseDate, loaded: cruiseLoaded } = useCruise();

  const { addItem, setSelection, open, count } = useCart();

  const [tour, setTour] = useState<TourSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selection, setSelectionLocal] = useState<DepartureSelection | null>(null);

  const handoffDate = sp.get("date") || "";
  const handoffPartySize = sp.get("partySize") || "";
  const handoffAdults = sp.get("adults") || "";
  const handoffChildren = sp.get("children") || "";
  const handoffCruiseShip = sp.get("cruiseShip") || "";
  const handoffCruiseShipSlug = sp.get("cruiseShipSlug") || "";
  const handoffTimeOfDay = sp.get("timeOfDay") || "";
  const handoffBudgetTier = sp.get("budgetTier") || "";
  const handoffSource = sp.get("source") || sp.get("handoffSource") || "";
  const handoffId = sp.get("handoff_id") || sp.get("handoffId") || "";
  const handoffAuthorityTopic = sp.get("authority_topic") || sp.get("topic") || "";
  const handoffReferrerPath = sp.get("referrer_path") || sp.get("referrerPath") || "";
  const handoffCategory = sp.get("category") || "";

  useEffect(() => {
    if (!cruiseLoaded || selectedDay) return;
    const handoffValid = handoffDate && /^\d{4}-\d{2}-\d{2}$/.test(handoffDate);
    const cruiseValid = cruiseDate && /^\d{4}-\d{2}-\d{2}$/.test(cruiseDate);
    const preferredDate = handoffValid ? handoffDate : (cruiseValid ? cruiseDate : "");
    if (preferredDate) setSelectedDay(preferredDate);
  }, [selectedDay, handoffDate, cruiseDate, cruiseLoaded]);

  // 1) Load tour snapshot
  useEffect(() => {
    async function loadTour() {
      try {
        const res = await fetch("/data/tours.json", { cache: "no-store" });
        const data = (await res.json()) as unknown;
        const tours = Array.isArray(data) ? (data as TourSnapshot[]) : [];

        const id = String(item);

        const found =
          tours.find((t) => t.company === company && String(t.pk) === id) ||
          tours.find((t) => t.company === company && t.slug === id);

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
        rateLabel: selection.rateLabel,

        handoffSource: handoffSource || undefined,
        handoffId: handoffId || undefined,
        authorityTopic: handoffAuthorityTopic || undefined,
        referrerPath: handoffReferrerPath || undefined,
        handoffCategory: handoffCategory || undefined,
        handoffDate: handoffDate || undefined,
        partySize: handoffPartySize ? Number(handoffPartySize) : undefined,
        adults: handoffAdults ? Number(handoffAdults) : undefined,
        children: handoffChildren ? Number(handoffChildren) : undefined,
        cruiseShip: handoffCruiseShip || undefined,
        cruiseShipSlug: handoffCruiseShipSlug || undefined,
        timeOfDay: handoffTimeOfDay || undefined,
        budgetTier: handoffBudgetTier || undefined,
        portSlug: inferPortFromCompany(company) || undefined,
      },
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

  const canAdd = Boolean(
    selection?.availabilityPk &&
    selection?.startAt &&
    selection?.ratePk &&
    selection?.qty,
  );
  const fromPriceCompany = String(tour.company || company);
  const fromPriceItem = tour.itemPk ?? tour.item ?? tour.pk ?? item;
  const seoOfferPrice = selection?.priceCents ? Number(selection.priceCents) / 100 : undefined;
  const seoData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title || "Alaska Shore Excursion",
    description: tour.shortDescription || tour.headline || "Cruise-friendly Alaska shore excursion.",
    image: heroSrc,
    provider: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      ...(seoOfferPrice ? { price: String(seoOfferPrice) } : {}),
      availability: "https://schema.org/InStock",
      url: typeof window !== "undefined" ? window.location.href : `https://welcometoalaskatours.com/tours/${company}/${item}`,
    },
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <JsonLd data={seoData} />
      <section className="relative h-[52vh] bg-slate-900">
        <Image
          src={heroSrc}
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover opacity-80"
          alt={tour.title || "Alaska shore excursion"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/tours"
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-1 text-sm font-bold uppercase text-white"
            >
              ← Back to tours
            </Link>
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
                  {tour.category || "Shore Excursion"}
                </div>
                <h1 className="mt-3 text-3xl font-black text-white drop-shadow-md sm:text-4xl lg:text-5xl">
                  {tour.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Pick your departure day and time, then checkout securely to confirm this tour.
                </p>
              </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-right backdrop-blur">
                <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-100">From</div>
                <div className="text-3xl font-black text-white">
                  <FromPrice company={fromPriceCompany} item={fromPriceItem} initial={tour.fromPrice} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {(handoffSource || handoffId || handoffDate || handoffPartySize || handoffCategory) ? (
            <div className="mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
              {handoffSource ? <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1">From {handoffSource} plan</span> : null}
              {handoffId ? <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1">Handoff {handoffId}</span> : null}
              {handoffCategory ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffCategory}</span> : null}
              {handoffDate ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffDate}</span> : null}
              {handoffPartySize ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">Party {handoffPartySize}</span> : null}
              {handoffCruiseShip ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffCruiseShip}</span> : null}
              {!handoffCruiseShip && handoffCruiseShipSlug ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffCruiseShipSlug}</span> : null}
              {handoffTimeOfDay ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffTimeOfDay}</span> : null}
              {handoffBudgetTier ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">{handoffBudgetTier}</span> : null}
            </div>
          ) : null}

          <h2 className="mb-3 text-2xl font-black tracking-tight text-slate-900">
            Choose Date and Departure Time
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Select your preferred day first, then choose an available departure that fits your cruise timing.
          </p>

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
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-xl">
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Best available rate</div>
              <div className="text-4xl font-black text-blue-700">
                <FromPrice company={fromPriceCompany} item={fromPriceItem} initial={tour.fromPrice} />
              </div>
            </div>

            <ItemBookingPicker
              selectedDay={selectedDay}
              selectedTimeLabel={selectedTimeLabel}
              priceLabel={priceLabel}
              canAdd={canAdd}
              onAdd={addToItinerary}
              cruiseShip={cruiseShip}
              cruiseDate={cruiseDate}
            />

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <div>Free cancellation policy depends on the tour operator.</div>
              <div>You will see live confirmation status right after checkout.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 pb-[env(safe-area-inset-bottom)]">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Selected</div>
            <div className="truncate text-sm font-bold text-slate-900">
              {selectedDay ? `${selectedDay} ${selectedTimeLabel || ""}`.trim() : "Choose a date and departure"}
            </div>
          </div>
          {count > 0 ? (
            <Link
              href="/checkout"
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800"
            >
              Checkout
            </Link>
          ) : null}
          <button
            type="button"
            onClick={addToItinerary}
            disabled={!canAdd}
            className="min-h-11 rounded-xl bg-indigo-700 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {canAdd ? "Add to Cart" : "Select Time"}
          </button>
        </div>
      </div>
    </main>
  );
}
