export const metadata = {
  title: "Welcome to Alaska Tours | Cruise Port Shore Excursions",
  description:
    "Premium Alaska cruise port shore excursions in Juneau, Skagway, and beyond. Curated experiences, local operators, seamless booking.",
};

export default function HomePage() {
  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroInner}>
          <h1 style={styles.h1}>Welcome to Alaska Tours</h1>
          <p style={styles.heroSub}>
            Premium Alaska cruise port shore excursions — curated, local, and unforgettable.
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

      {/* VALUE PROPS */}
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

      {/* PORTS */}
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

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Welcome to Alaska Tours</p>
      </footer>
    </main>
  );
}

const styles = {
  page: {
    background: "#000",
    color: "#eaf6ff",
    minHeight: "100vh",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
  },

  hero: {
    position: "relative",
    minHeight: "85vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundImage: "url('/images/home-hero.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(2,11,26,0.75), rgba(0,0,0,0.9))",
  },

  heroInner: {
    position: "relative",
    zIndex: 1,
    maxWidth: 900,
    padding: "0 24px",
  },

  h1: {
    fontSize: 48,
    marginBottom: 16,
  },

  heroSub: {
    fontSize: 20,
    opacity: 0.9,
  },

  heroActions: {
    marginTop: 32,
    display: "flex",
    gap: 16,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  primaryBtn: {
    background: "#1ea7ff",
    color: "#000",
    padding: "14px 22px",
    borderRadius: 10,
    fontWeight: 700,
    textDecoration: "none",
  },

  secondaryBtn: {
    border: "1px solid #1ea7ff",
    color: "#1ea7ff",
    padding: "14px 22px",
    borderRadius: 10,
    textDecoration: "none",
  },

  value: {
    padding: "80px 24px",
    background: "#000",
  },

  valueGrid: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
    textAlign: "center",
  },

  ports: {
    padding: "80px 24px",
    textAlign: "center",
    background: "#000",
  },

  h2: {
    fontSize: 36,
    marginBottom: 32,
  },

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
    background: "#000",
  },
};
