"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { HelicopterTour } from "@/lib/helicopterTours";
import { buildTourPriceLabel } from "@/lib/tourSeo";
import { canonicalizePortSlug } from "@/lib/dccSatellite";
import {
  appendWidgetContextToSearchParams,
  resolveWidgetInitContext,
} from "@/lib/widgetContext";
import { emitWidgetLifecycleEvent, widgetViewStorageKey } from "@/components/widget/widgetLifecycle";

type CatalogMode = "widget" | "tours";

const isGenericDescription = (desc: string) => {
  const d = desc.toLowerCase();
  return d.includes("cruise-friendly") || d.includes("memorable day in port") || d.includes("without wasting time");
};

function bookingHref(tour: HelicopterTour, search: URLSearchParams) {
  if (tour.nextAvailableDate) {
    const d = new Date(tour.nextAvailableDate);
    if (!Number.isNaN(d.getTime())) {
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const params = new URLSearchParams(search.toString());
      params.set("month", month);
      return `/tours/${tour.company}/${tour.pk}/calendar?${params.toString()}`;
    }
  }
  const qs = search.toString();
  return qs ? `/tours/${tour.company}/${tour.pk}/calendar?${qs}` : `/tours/${tour.company}/${tour.pk}/calendar`;
}

export function WidgetCatalog({
  tours,
  mode = "widget",
}: {
  tours: HelicopterTour[];
  mode?: CatalogMode;
}) {
  const search = useSearchParams();
  const pathname = usePathname();
  const widgetContext = useMemo(() => resolveWidgetInitContext(search), [search]);

  useEffect(() => {
    if (!widgetContext.handoffId || widgetContext.source !== "dcc") return;

    const storageKey = widgetViewStorageKey(widgetContext.handoffId, pathname, widgetContext.widgetId);
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) return;

    void emitWidgetLifecycleEvent({
      ...widgetContext,
      portSlug: widgetContext.portSlug || canonicalizePortSlug("juneau"),
      eventType: "handoff_viewed",
      sourcePath: pathname,
      status: "viewed",
      stage: "widget_rendered",
    }).then(() => {
      if (typeof window !== "undefined") sessionStorage.setItem(storageKey, "1");
    });
  }, [pathname, widgetContext]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      {mode === "widget" && (
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-7">
          <div className="absolute inset-0">
            <img
              src={tours[0]?.image || "/hero/juneau.jpg"}
              alt="Juneau helicopter tours"
              className="h-full w-full object-cover opacity-35"
              loading="eager"
            />
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.66)_44%,rgba(2,6,23,0.9)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.26),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_24%)]" />
          </div>
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
              Juneau Helicopter Tours
            </div>
            <h1 className="mt-4 text-[2.3rem] font-black uppercase leading-[0.94] tracking-[-0.04em] text-white sm:text-[3.8rem]">
              Compare tours fast. Open the right one.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-[15px]">
              Cruise-day friendly Juneau helicopter tour pages with cleaner visuals, faster scanning,
              and one clear path into the booking calendar.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Live booking calendar
              </div>
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Cruise-day friendly
              </div>
              <div className="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/88">
                Helicopter tours only
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/date-search"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-slate-955"
              >
                Search By Date
              </Link>
              <Link
                href="/tours"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/14 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
              >
                Browse All Tours
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        {tours.map((tour) => {
          const params = appendWidgetContextToSearchParams(
            new URLSearchParams(search.toString()),
            {
              ...widgetContext,
              portSlug: widgetContext.portSlug || canonicalizePortSlug(tour.port),
              productSlug: widgetContext.productSlug || tour.slug,
            },
          );
          const qs = params.toString();
          const detailBasePath = mode === "tours" ? "/tours" : "/widget";
          const detailHref = qs
            ? `${detailBasePath}/${tour.company}/${tour.pk}?${qs}`
            : `${detailBasePath}/${tour.company}/${tour.pk}`;
          const bookingPageHref = bookingHref(tour, new URLSearchParams(qs));
          const imageSrc = tour.image || "/hero/juneau.jpg";
          const hasNextAvailability = Boolean(tour.nextAvailableDate);
          const availabilityIsUnknown = !hasNextAvailability && tour.hasInventory !== false;
          const priceLabel = buildTourPriceLabel(tour);

          return (
            <article
              key={`${tour.company}:${tour.pk}`}
              className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full">
                <img
                  src={imageSrc}
                  alt={tour.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur-md">
                  {tour.company.replace(/-/g, " ")}
                </div>
                <div className="absolute bottom-4 right-4 rounded-2xl border border-white/25 bg-white/15 px-3 py-2 text-right text-white shadow-lg backdrop-blur-md">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                    {tour.category || "Juneau Tour"}
                  </div>
                  <div className="text-sm font-black">{priceLabel}</div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
                    {tour.title}
                  </h2>
                  
                  {!isGenericDescription(tour.description || "") && tour.description && (
                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-1">
                      {tour.description}
                    </p>
                  )}

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 text-[10px] border-y border-slate-100 my-2">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Duration</span>
                      <span className="font-extrabold text-slate-800">{(() => {
                        const m = (tour.description || "").match(/\b(\d+(?:\.\d+)?)\s*Hours?\b/i);
                        return m ? `${m[1]} Hours` : "2-3 Hours";
                      })()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">From Price</span>
                      <span className="font-extrabold text-slate-800">{priceLabel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold uppercase tracking-wider text-[8px]">Availability</span>
                      <span className={`font-extrabold ${hasNextAvailability ? "text-emerald-700" : "text-amber-700"}`}>
                        {hasNextAvailability ? "Live Dates" : "Check Calendar"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 sm:flex-row pt-2 border-t border-slate-100">
                  <Link
                    href={detailHref}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    View Product
                  </Link>
                  {hasNextAvailability ? (
                    <Link
                      href={bookingPageHref}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-bold text-slate-955 hover:bg-cyan-300 transition"
                    >
                      Book Now
                    </Link>
                  ) : availabilityIsUnknown ? (
                    <Link
                      href={bookingPageHref}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-cyan-400 px-4 text-xs font-bold text-slate-955 hover:bg-cyan-300 transition"
                    >
                      Check Dates
                    </Link>
                  ) : (
                    <div className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-amber-250 bg-amber-50 px-4 text-xs font-bold text-amber-900">
                      No live dates
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
