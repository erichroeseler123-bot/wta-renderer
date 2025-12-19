import DCCRotatingMap from '../../components/DCCRotatingMap';
export default async function Page({ params }) {
  const { slug } = await params;

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span style={styles.badge}>DCC Destination</span>
          <h1 style={styles.title}>
            {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </h1>
          <p style={styles.meta}>
            Tours • Helicopters • Port Intelligence
          </p>
        </div>
      </section>
      <DCCRotatingMap slug={slug} />

      {/* BODY */}
      <section style={styles.body}>
        <div style={styles.grid}>
          <a href={`/ports/${slug}/tours`} style={styles.card}>
            <h3>Standard Tours</h3>
            <p>Whale watching, railroads, sightseeing</p>
          </a>

          <a href={`/ports/${slug}/helicopter-tours`} style={styles.card}>
            <h3>Helicopter Tours</h3>
            <p>Glacier landings & aerial Alaska</p>
          </a>

          <div style={styles.card}>
            <h3>Port Info</h3>
            <p>Logistics, docks, timing (coming soon)</p>
          </div>
        </div>
      </section>
      <DCCRotatingMap slug={slug} />
    </main>
  );
}

const styles = {
  page: { background: '#0b0e14', color: '#e6e9ef', minHeight: '100vh' },

  hero: {
    position: 'relative',
    height: '55vh',
    minHeight: 420,
    backgroundImage:
      'url(https://images.unsplash.com/photo-1549880338-65ddcdfd017b)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(to bottom, rgba(11,14,20,0.25), rgba(11,14,20,0.95))',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 40px',
    maxWidth: 900,
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.5)',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 12,
  },
  title: { fontSize: 44, margin: '10px 0' },
  meta: { color: '#c9d1ff', fontSize: 16 },

  body: {
    padding: 40,
    maxWidth: 1200,
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#111521',
    border: '1px solid #1f2430',
    borderRadius: 14,
    padding: 24,
    textDecoration: 'none',
    color: 'inherit',
  },
};
