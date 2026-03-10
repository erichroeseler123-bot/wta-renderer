import Link from "next/link";
import type { Metadata } from "next";
import styles from "./home.module.css";
import { getToursFromFareHarbor } from "@/lib/data/tours";
import { inferPortFromCompany } from "@/lib/handoff/mappings";

export const metadata: Metadata = {
  title: "Alaska Flight Tours | Live FareHarbor Inventory",
  description:
    "Browse Alaska flight tours from live FareHarbor inventory, including helicopter and seaplane options.",
  alternates: {
    canonical: "https://welcometoalaskatours.com/home",
  },
};

function providerRank(companyRaw: string): number {
  const company = String(companyRaw || "").toLowerCase();
  if (company === "coastalhelicopters") return 0;
  if (company === "northstartrekking") return 1;
  if (company.startsWith("temsco")) return 2;
  return 99;
}

function isExcludedOffer(tour: { title?: string; description?: string }): boolean {
  const text = `${tour.title || ""} ${tour.description || ""}`.toLowerCase();
  const blockedPhrases = [
    "gift card",
    "gift cards",
    "fundraising",
    "fundraiser",
    "local's day",
    "locals day",
    "for locals",
    "locals only",
    "resident",
    "residents only",
  ];
  return blockedPhrases.some((phrase) => text.includes(phrase));
}

function cityForTour(companyRaw: string): "juneau" | "skagway" | null {
  const company = String(companyRaw || "").toLowerCase();
  if (company.includes("skagway")) return "skagway";

  const inferred = inferPortFromCompany(company);
  if (inferred === "juneau") return "juneau";
  if (inferred === "skagway") return "skagway";
  return null;
}

function formatUpdatedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export default async function HomeFlightsPage() {
  const tours = await getToursFromFareHarbor();
  const flights = tours
    .filter((tour) => providerRank(tour.fareharbor?.company || "") < 3)
    .filter((tour) => !isExcludedOffer(tour))
    .filter((tour) => cityForTour(tour.fareharbor?.company || "") !== null)
    .sort((a, b) => {
      const rankDiff = providerRank(a.fareharbor?.company || "") - providerRank(b.fareharbor?.company || "");
      if (rankDiff !== 0) return rankDiff;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 24);

  const juneauFlights = flights.filter((f) => cityForTour(f.fareharbor?.company || "") === "juneau");
  const skagwayFlights = flights.filter((f) => cityForTour(f.fareharbor?.company || "") === "skagway");

  const updatedAt = formatUpdatedAt(new Date());

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.logo} aria-label="Flight Desk logo">
          <span className={styles.logoWing} aria-hidden="true">
            ✈
          </span>
          <span className={styles.logoText}>Flight Desk</span>
        </div>
        <p className={styles.kicker}>Flights</p>
        <h1 className={styles.title}>Alaska Flight Tours</h1>
        <p className={styles.subtitle}>
          This page is powered by the same FareHarbor API inventory used in booking. Open any flight to check
          live availability and book.
        </p>
        <div className={styles.actions}>
          <Link href="/tours?q=flight" className={styles.primaryBtn}>
            Browse All Flights
          </Link>
          <Link href="/contact-us" className={styles.secondaryBtn}>
            Contact Support
          </Link>
        </div>
        <p className={styles.updatedAt}>Updated: {updatedAt}</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Live Flight Inventory</h2>
          <span>{flights.length} results</span>
        </div>

        {flights.length < 1 ? (
          <div className={styles.emptyState}>
            <h3>No flight products are available right now.</h3>
            <p>Try again shortly, or browse all current tours.</p>
            <Link href="/tours" className={styles.primaryBtn}>
              Browse All Tours
            </Link>
          </div>
        ) : (
          <>
            <h3 className={styles.cityHeading}>Juneau</h3>
            {juneauFlights.length < 1 ? (
              <p className={styles.cityEmpty}>No Juneau flights available right now.</p>
            ) : (
              <div className={styles.grid}>
                {juneauFlights.map((flight) => (
                  <article key={`${flight.fareharbor.company}:${flight.pk}`} className={styles.card}>
                    {flight.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.cardImage} src={flight.image} alt={flight.title} loading="lazy" />
                    ) : (
                      <div className={styles.cardImageFallback}>Flight Tour</div>
                    )}
                    <p className={styles.company}>{flight.fareharbor.company}</p>
                    <h3>{flight.title}</h3>
                    <p className={styles.meta}>
                      {flight.fromPrice || "Check Price"}
                      {flight.duration ? ` • ${flight.duration}` : ""}
                    </p>
                    <p className={styles.description}>{flight.description || "View details and availability."}</p>
                    <Link href={`/tours/${flight.fareharbor.company}/${flight.pk}`} className={styles.cardBtn}>
                      View Flight
                    </Link>
                  </article>
                ))}
              </div>
            )}

            <h3 className={styles.cityHeading}>Skagway</h3>
            {skagwayFlights.length < 1 ? (
              <p className={styles.cityEmpty}>No Skagway flights available right now.</p>
            ) : (
              <div className={styles.grid}>
                {skagwayFlights.map((flight) => (
                  <article key={`${flight.fareharbor.company}:${flight.pk}`} className={styles.card}>
                    {flight.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.cardImage} src={flight.image} alt={flight.title} loading="lazy" />
                    ) : (
                      <div className={styles.cardImageFallback}>Flight Tour</div>
                    )}
                    <p className={styles.company}>{flight.fareharbor.company}</p>
                    <h3>{flight.title}</h3>
                    <p className={styles.meta}>
                      {flight.fromPrice || "Check Price"}
                      {flight.duration ? ` • ${flight.duration}` : ""}
                    </p>
                    <p className={styles.description}>{flight.description || "View details and availability."}</p>
                    <Link href={`/tours/${flight.fareharbor.company}/${flight.pk}`} className={styles.cardBtn}>
                      View Flight
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <div className={styles.mobileSticky}>
        <Link href="/tours?q=flight">Book A Flight</Link>
      </div>
    </main>
  );
}
