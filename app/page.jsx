export const metadata = {
  title: "Welcome to Alaska Tours | Cruise Port Shore Excursions",
  description:
    "Premium Alaska cruise port shore excursions in Juneau, Skagway, and beyond. Curated experiences, local operators, seamless booking.",
};

export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.h1}>Welcome to Alaska Tours</h1>
          <p style={styles.heroSub}>
            Premium Alaska cruise port shore excursions —
            curated, local, and unforgettable.
          </p>
          <div style={styles.heroActions}>
            <a href="/ports/juneau" style={styles.primaryBtn}>
              Explore Juneau Tours
            </a>
            <a href="#ports" style={styles.secondaryBtn}>
              View Cruise Ports
            </a>
          </div>
        </div>
      </section>

      <section style={styles.value}>
        <div style={styles.valueGrid}>
          <div>
            <h3>🚢 Cruise-Optimized</h3>
            <p>Tours designed around real ship arrival windows.</p>
          </div>
          <div>
            <h3>🧭 Local Experts</h3>
            <p>Operated by trusted Alaskan tour companies.</p>
          </div>
          <div>
            <h3>⚡ Easy Booking</h3>
            <p>Fast checkout, clear pricing, zero stress.</p>
          </div>
        </div>
      </section>

      <section id="ports" style={styles.ports}>
        <h2 style={styles.h2}>Alaska Cruise Ports</h2>
        <div style={styles.portGrid}>
          <a href="/ports/juneau" style={styles.portCard}>
            <h3>Juneau</h3>
            <p>Glaciers, whales, helicopters & alpine views</p>
          </a>

          <div style={styles.portCardDisabled}>
            <h3>Skagway</h3>
            <p>Launching soon</p>
          </div>

          <div style={styles.portCardDisabled}>
            <h3>Ketchikan</h3>
            <p>Launching soon</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Welcome to Alaska Tours</p>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    background: "linear-gradient(180deg, #020b1a, #000)",
    color: "#eaf6ff",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
  },
hero: {
  padding: "160px 24px 160px",
  textAlign: "center",
  backgroundImage:
    "linear-gradient(rgba(2,11,26,0.55), rgba(2,11,26,0.85)), url('/images/home-hero.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
},

heroInner: {
  maxWidth: 900,
  margin: "0 auto",
  padding: "48px",
},

  secondaryBtn: {
    border: "1px solid #1ea7ff",
    color: "#1ea7ff",
    padding: "14px 22px",
    borderRadius: 10,
    textDecoration: "none",
  },
  value: { padding: "80px 24px" },
  valueGrid: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
    textAlign: "center",
  },
  ports: { padding: "80px 24px", textAlign: "center" },
  h2: { fontSize: 36, marginBottom: 32 },
  portGrid: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },
  portCard: {
    background: "#081a33",
    padding: 24,
    borderRadius: 14,
    textDecoration: "none",
    color: "#eaf6ff",
    border: "1px solid #1ea7ff55",
  },
  portCardDisabled: {
    background: "#081a33",
    padding: 24,
    borderRadius: 14,
    opacity: 0.45,
  },
  footer: {
    padding: 40,
    textAlign: "center",
    opacity: 0.6,
  },
};
