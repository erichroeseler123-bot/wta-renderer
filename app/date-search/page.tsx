import type { Metadata } from "next";
import Link from "next/link";
import {
  getHelicopterTourDeparturesForDate,
  type HelicopterTourDeparture,
} from "@/lib/helicopterTours";
import { cleanTourDescription } from "@/lib/tourSeo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Juneau Helicopter Tours By Date | Welcome To Alaska Tours",
  description:
    "Enter your Juneau cruise date and see helicopter tour departures across participating operators from FareHarbor live inventory.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/date-search",
  },
  openGraph: {
    title: "Juneau Helicopter Tours By Date | Welcome To Alaska Tours",
    description:
      "Choose one date and compare Juneau helicopter departures across operators.",
    url: "https://welcometoalaskatours.com/date-search",
    type: "website",
  },
};

function isIsoDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function formatTime(startAt: string) {
  const parsed = new Date(startAt);
  if (Number.isNaN(parsed.getTime())) return startAt.slice(11, 16);
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Juneau",
  });
}

function formatDateLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatPrice(cents?: number) {
  if (!Number.isFinite(cents) || !cents || cents <= 0) return null;
  const dollars = cents / 100;
  return dollars % 1 === 0 ? `From $${dollars.toFixed(0)}` : `From $${dollars.toFixed(2)}`;
}

function normalizeCompanyLabel(company: string) {
  return company
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function groupDepartures(departures: HelicopterTourDeparture[]) {
  const grouped = new Map<
    string,
    Array<{ tourKey: string; tour: HelicopterTourDeparture; departures: HelicopterTourDeparture[] }>
  >();

  for (const departure of departures) {
    const companyLabel = normalizeCompanyLabel(departure.company);
    const tourKey = `${departure.company}:${departure.itemPk}`;
    const operatorGroup = grouped.get(companyLabel) || [];
    const existingTour = operatorGroup.find((entry) => entry.tourKey === tourKey);
    if (existingTour) {
      existingTour.departures.push(departure);
    } else {
      operatorGroup.push({
        tourKey,
        tour: departure,
        departures: [departure],
      });
    }
    grouped.set(companyLabel, operatorGroup);
  }

  return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function DateSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const selectedDate = isIsoDate(sp.date) ? sp.date : "";
  const departures = selectedDate
    ? await getHelicopterTourDeparturesForDate(selectedDate)
    : [];
  const grouped = groupDepartures(departures);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_42%,#ffffff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/tours"
          className="inline-flex rounded-xl border border-sky-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white"
        >
          Back to tours
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#082f49_0%,#0f172a_42%,#134e4a_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] sm:p-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
              Juneau helicopter tours by date
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Pick one date. See all helicopter tours.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-[15px]">
              Enter your Juneau port day and compare FareHarbor departures across the helicopter
              operators currently on the site. Each result links into the existing booking flow for
              that exact tour and date.
            </p>
          </div>

          <form action="/date-search" method="get" className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="min-h-14 flex-1 rounded-2xl border border-white/15 bg-white px-4 text-base font-semibold text-slate-900 outline-none ring-0"
            />
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-cyan-300 px-6 text-sm font-black uppercase tracking-[0.12em] text-slate-950"
            >
              Show tours
            </button>
          </form>
        </section>

        {selectedDate ? (
          <section className="mt-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                Selected date
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                {formatDateLabel(selectedDate)}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {departures.length
                  ? `${departures.length} departure${departures.length === 1 ? "" : "s"} showing across ${grouped.length} operator${grouped.length === 1 ? "" : "s"}.`
                  : "No live helicopter departures are posted for this date right now."}
              </p>
            </div>
          </section>
        ) : null}

        {!selectedDate ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight">How to use this page</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Choose your Juneau cruise date first. This page then checks FareHarbor inventory for
              every helicopter tour currently carried on Welcome To Alaska Tours and shows the
              departures that match that exact day.
            </p>
          </section>
        ) : null}

        {grouped.length ? (
          <section className="mt-6 grid gap-5">
            {grouped.map(([companyLabel, tours]) => (
              <article
                key={companyLabel}
                className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                      Operator
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">{companyLabel}</h2>
                  </div>
                  <div className="text-sm font-semibold text-slate-600">
                    {tours.reduce((count, tour) => count + tour.departures.length, 0)} departures
                  </div>
                </div>

                <div className="mt-5 grid gap-4">
                  {tours.map(({ tour, departures: tourDepartures }) => (
                    <section
                      key={`${tour.company}:${tour.itemPk}`}
                      className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50"
                    >
                      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="p-5 sm:p-6">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {tour.category || "Juneau helicopter tour"}
                          </div>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                            {tour.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {cleanTourDescription(
                              tour.description,
                              "Open the booking page to confirm passenger types and checkout details.",
                            )}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tour.fromPrice ? (
                              <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                                {tour.fromPrice}
                              </div>
                            ) : null}
                            <Link
                              href={`/tours/${tour.company}/${tour.itemPk}`}
                              className="inline-flex rounded-full border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white"
                            >
                              View product
                            </Link>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 bg-white p-5 sm:p-6 lg:border-t-0 lg:border-l">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Departures on {selectedDate}
                          </div>
                          <div className="mt-4 grid gap-3">
                            {tourDepartures.map((departure) => (
                              <Link
                                key={departure.availabilityPk}
                                href={`/tours/${departure.company}/${departure.itemPk}/calendar/${selectedDate}`}
                                className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-100"
                              >
                                <div>
                                  <div className="text-lg font-black tracking-tight text-slate-900">
                                    {formatTime(departure.startAt)}
                                  </div>
                                  <div className="text-xs font-medium text-slate-600">
                                    {departure.capacity !== null
                                      ? `Capacity ${departure.capacity}`
                                      : "Capacity varies by rate"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-slate-900">
                                    {formatPrice(departure.priceCents) || "Check live pricing"}
                                  </div>
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                                    Open booking
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
