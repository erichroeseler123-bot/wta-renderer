import Link from "next/link";
import type { Metadata } from "next";
import styles from "./home.module.css";
import { getToursFromFareHarbor } from "@/lib/data/tours";

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
    .sort((a, b) => {
      const rankDiff = providerRank(a.fareharbor?.company || "") - providerRank(b.fareharbor?.company || "");
      if (rankDiff !== 0) return rankDiff;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 24);

  const updatedAt = formatUpdatedAt(new Date());

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
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
          <div className={styles.grid}>
            {flights.map((flight) => (
              <article key={`${flight.fareharbor.company}:${flight.pk}`} className={styles.card}>
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
      </section>

      <div className={styles.mobileSticky}>
        <Link href="/tours?q=flight">Book A Flight</Link>
      </div>
    </main>
  );
}
