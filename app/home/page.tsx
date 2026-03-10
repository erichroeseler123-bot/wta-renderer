import Link from "next/link";
import { Baloo_2, Bungee } from "next/font/google";
import styles from "./home.module.css";
import { flightsHomeContent } from "@/lib/content/flightsHome";

const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export default function HomeFlightsPage() {
  return (
    <main className={`${styles.page} ${baloo.className}`}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroTopRow}>
            <span className={styles.heroBadge}>Flights Only</span>
            <span className={styles.heroBadgeAlt}>Mobile First</span>
          </div>
          <h1 className={`${styles.heroTitle} ${bungee.className}`}>{flightsHomeContent.heroTitle}</h1>
          <p className={styles.heroText}>{flightsHomeContent.heroText}</p>
          <div className={styles.heroArt}>
            <div className={styles.heroArtRow}>
              <span className={styles.cloud}>Fast Seats</span>
              <span className={styles.plane}>✈</span>
              <span className={styles.cloud}>Happy Crew</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className={styles.primaryBtn} href={flightsHomeContent.primaryCtaHref}>
              {flightsHomeContent.primaryCtaLabel}
            </Link>
            <Link className={styles.secondaryBtn} href={flightsHomeContent.secondaryCtaHref}>
              {flightsHomeContent.secondaryCtaLabel}
            </Link>
          </div>
          <div className={styles.jets}>
            <div className={styles.jet}>✈</div>
            <div className={styles.jet}>☁</div>
            <div className={styles.jet}>✈</div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${bungee.className}`}>Pick Your Flight</h2>
          <div className={styles.flightGrid}>
            {flightsHomeContent.flights.map((flight) => (
              <article key={flight.name} className={styles.flightCard}>
                <h3 className={`${styles.flightName} ${bungee.className}`}>{flight.name}</h3>
                <p className={styles.flightMeta}>{flight.meta}</p>
                <p className={styles.flightCopy}>{flight.copy}</p>
                <span className={styles.miniPill}>{flight.badge}</span>
                <Link
                  className={styles.cardAction}
                  href={`${flightsHomeContent.primaryCtaHref}?flight=${encodeURIComponent(flight.name)}`}
                >
                  Choose This Flight
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${bungee.className}`}>Why Flyers Love It</h2>
          <div className={styles.whyGrid}>
            {flightsHomeContent.whyFly.map((point) => (
              <div key={point} className={styles.whyCard}>
                {point}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={`${styles.sectionTitle} ${bungee.className}`}>Flight FAQ</h2>
          {flightsHomeContent.faqs.map((faq) => (
            <details key={faq.q} className={styles.faq}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </section>

        <section className={styles.footerCta}>
          <h2 className={bungee.className}>{flightsHomeContent.footerTitle}</h2>
          <p>{flightsHomeContent.footerText}</p>
        </section>

        <div className={styles.mobileSticky}>
          <Link href={flightsHomeContent.primaryCtaHref}>Book Flight Now</Link>
        </div>
      </div>
    </main>
  );
}
