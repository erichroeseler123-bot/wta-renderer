import type { Metadata } from "next";
import Link from "next/link";
import PlanTelemetry from "@/app/components/plan/PlanTelemetry";
import { getHelicopterToursSnapshot, type HelicopterTour } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";
import {
  buildAlaskaTourShortlist,
  normalizeTripStyle,
  STYLE_COPY,
} from "@/lib/alaskaTourRecommendations";

export const metadata: Metadata = {
  title: "Choose Your Best Alaska Shore Excursion",
  description:
    "Choose Juneau, Skagway, or Ketchikan, tell us what kind of Alaska day you want, and get a four-tour shortlist from connected excursion inventory.",
  alternates: { canonical: "https://welcometoalaskatours.com/plan" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function normalize(value: string | undefined) {
  return String(value || "").trim().toLowerCase();
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function PlanPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const port = normalize(readParam(params.port)) || "juneau";
  const style = normalizeTripStyle(readParam(params.topic) || readParam(params.subtype));
  const ship = readParam(params.cruiseShip).trim();
  const date = readParam(params.date).trim();
  const sourcePage = readParam(params.sourcePage).trim() || "/";
  const styleCopy = STYLE_COPY[style];

  const allTours = sanitizeTours(await getHelicopterToursSnapshot()) as HelicopterTour[];
  const portTours = allTours.filter((tour) => tour.port === port);
  const { recommendations, exactCount } = buildAlaskaTourShortlist(portTours, style, 4);
  const portLabel = titleCase(port);
  const degradedFallback = style !== "best-overall" && exactCount < recommendations.length;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_35%,#ffffff_100%)] text-slate-950">
      <PlanTelemetry
        base={{
          requestedLane: style,
          resolvedLane: style,
          degradedFallback,
          reason: degradedFallback
            ? "Direct matches were supplemented with the strongest overall port-day alternatives."
            : "The shortlist resolved from the requested Alaska trip style.",
          port,
          topic: style,
          sourcePage,
        }}
        impressions={recommendations.map((recommendation, index) => ({
          productSlug: `${recommendation.tour.company}/${recommendation.tour.slug}`,
          rank: index + 1,
        }))}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/#find-your-port-day" className="text-sm font-bold text-sky-800 hover:text-sky-950">← Change my choices</Link>

        <section className="mt-4 overflow-hidden rounded-[2.25rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_52%,#164e63_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">Your 4-tour shortlist</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{styleCopy.label} in {portLabel}</h1>
            <p className="mt-4 text-sm leading-7 text-white/85 sm:text-[15px]">{styleCopy.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/10 px-3 py-2">{portLabel}</span>
              {ship ? <span className="rounded-full bg-white/10 px-3 py-2">{ship}</span> : null}
              {date ? <span className="rounded-full bg-white/10 px-3 py-2">{date}</span> : null}
            </div>
            {style !== "best-overall" && exactCount < 4 ? (
              <div className="mt-5 rounded-2xl border border-cyan-200/20 bg-white/10 px-4 py-3 text-sm text-cyan-50">
                We found {exactCount} direct {styleCopy.label.toLowerCase()} match{exactCount === 1 ? "" : "es"} in this port. The remaining spots are the strongest overall alternatives from the same port.
              </div>
            ) : null}
          </div>
        </section>

        {!recommendations.length ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black">No connected tours found for {portLabel}.</h2>
            <p className="mt-3 text-sm text-slate-600">Browse the full catalog or choose another port while inventory is refreshed.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/tours" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Browse all tours</Link>
              <Link href="/#find-your-port-day" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900">Choose another port</Link>
            </div>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            {recommendations.map((recommendation, index) => {
              const productKey = `${recommendation.tour.company}/${recommendation.tour.slug}`;
              const contextParams = new URLSearchParams({
                from: "plan",
                rank: String(index + 1),
                sourcePage: "/plan",
                port,
                topic: style,
                productSlug: productKey,
                requestedLane: style,
                resolvedLane: style,
                degradedFallback: String(degradedFallback),
              });
              const detailHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}?${contextParams.toString()}`;
              const calendarParams = new URLSearchParams(contextParams);
              if (date) calendarParams.set("date", date);
              if (ship) calendarParams.set("cruiseShip", ship);
              const calendarHref = `/tours/${recommendation.tour.company}/${recommendation.tour.pk}/calendar?${calendarParams.toString()}`;

              return (
                <article key={`${recommendation.tour.company}-${recommendation.tour.pk}`} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={recommendation.tour.image || "/images/home-hero.jpg"} alt={recommendation.tour.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">Choice {index + 1} · {recommendation.reason}</div>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{recommendation.tour.title}</h2>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{recommendation.tour.fromPrice || "Check price"}</div>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{recommendation.tour.description || "Open the tour details for operator description, meeting information and booking calendar."}</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Timing</div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{recommendation.duration}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Know before booking</div>
                        <div className="mt-1 text-xs leading-5 font-semibold text-slate-700">{recommendation.tradeoff}</div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Link
                        href={detailHref}
                        data-plan-click
                        data-product-slug={productKey}
                        data-rank={index + 1}
                        data-next-step="detail"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-900 hover:bg-slate-50"
                      >
                        See details
                      </Link>
                      <Link
                        href={calendarHref}
                        data-plan-click
                        data-product-slug={productKey}
                        data-rank={index + 1}
                        data-next-step="calendar"
                        className="rounded-xl bg-sky-700 px-4 py-3 text-center text-sm font-black text-white hover:bg-sky-800"
                      >
                        Check live calendar →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-6 rounded-[2rem] border border-sky-100 bg-sky-50 p-6 sm:p-7">
          <h2 className="text-xl font-black text-slate-950">The calendar is the final check.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These are shopping recommendations from the connected catalog, not guarantees of availability or ship compatibility. Open the live calendar, confirm the operator meeting instructions, and compare the actual departure with your cruise line&apos;s all-aboard time before booking.</p>
        </section>
      </div>
    </main>
  );
}
