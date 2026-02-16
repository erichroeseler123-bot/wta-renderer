import { notFound } from "next/navigation";
import ProductDepartureCalendar from "@/components/tours/ProductDepartureCalendar";
import Link from "next/link";
import { getUnsplashImage } from "@/lib/unsplash";

export const dynamic = "force-dynamic";

function niceTitle(company: string) {
  return company
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ company: string; item: string }>;
}) {
  const { company, item } = await params;

  if (!company || !item) return notFound();

  const itemPk = Number(item);
  if (!Number.isFinite(itemPk)) return notFound();

  const title = `Tour #${itemPk}`;
  const companyTitle = niceTitle(company);

  // Optional hero image (keep it lightweight)
  const imageUrl = await getUnsplashImage(` alaska tour glacier`);
  const heroSrc = typeof imageUrl === "string" ? imageUrl : "";

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          {heroSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroSrc}
              alt={"Alaska tour"}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-14 md:py-16">
          <div className="text-xs text-white/60">
            <Link href="/tours" className="hover:text-white/80">
              Tours
            </Link>
            <span className="mx-2 text-white/35">/</span>
            <span className="text-white/75">{companyTitle}</span>
          </div>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            {companyTitle}
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-white/75 md:text-base">
            Pick a date, choose a real departure time, select passengers, and
            add the exact FareHarbor availability slot to your itinerary.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tours"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              ← Back to tours
            </Link>
            <Link
              href={`/tours/${company}/${item}/calendar`}
              className="rounded-2xl border border-[#4CC9F0]/25 bg-[#4CC9F0]/15 px-4 py-2 text-sm text-white hover:bg-[#4CC9F0]/22 transition"
            >
              View full calendar →
            </Link>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white/90">
                What to expect
              </h2>
              <p className="mt-2 text-sm text-white/70">
                This page is wired to live FareHarbor inventory. We’ll swap this
                placeholder description with the real product details next.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Company</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    {company}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs text-white/60">Item PK</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">
                    {itemPk}
                  </div>
                </div>
              </div>
            </div>

            {/* BOOKING PICKER (product page) */}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-white/90">
                Cruise-window ready
              </div>
              <div className="mt-2 text-sm text-white/65">
                Next step: add port arrive / all-aboard times + buffer and
                filter departures automatically.
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              {" "}
              <div className="mt-2 text-sm text-white/65">
                Your selection is saved to the cart as an availability slot pk
                (real inventory).
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white/90">
          Review departures
        </h2>
        <a
          href={`/tours///calendar`}
          className="mt-3 inline-flex text-sm font-semibold text-[#4CC9F0] hover:underline"
        >
          Open full calendar →
        </a>
        <p className="mt-2 text-sm text-white/70">
          Pick a date to see real-time availability and times.
        </p>
        <div className="mt-6">
          <ProductDepartureCalendar company={company} itemPk={itemPk} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white/90">
          Review departures
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Pick a date to see real-time departures and availability.
        </p>
        <div className="mt-6">
          <ProductDepartureCalendar company={company} itemPk={itemPk} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white/90">
          Review departures
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Pick a date to see real-time departures and availability.
        </p>
        <div className="mt-6">
          <ProductDepartureCalendar company={company} itemPk={itemPk} />
        </div>
      </section>
    </main>
  );
}
