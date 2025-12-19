import DCCPortMap from '../../components/DCCPortMap';

export default async function Page({ params }) {
  const { slug } = await params;

  return (
    <main style={styles.page}>
      {/* MAP HERO */}
      <section style={styles.mapHero}>
        <DCCPortMap slug={slug} />
        <div style={styles.mapOverlay}>
          <span style={styles.badge}>DCC Port View</span>
          <h1 style={styles.title}>
            {slug.charAt(0).toUpperCase() + slug.slice(1)}
          </h1>
          <p style={styles.meta}>
            Live spatial overview • Tours • Air • Sea
          </p>
        </div>
      </section>

      {/* ACTION GRID */}
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
            <h3>Port Intelligence</h3>
            <p>Docks, timing, logistics (coming soon)</p>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    background: '#0b0e14',
    color: '#e6e9ef',
    minHeight: '100vh',
  },

  /* MAP HERO */
  mapHero: {
    position: 'relative',
    height: '70vh',
    minHeight: 480,
    position: 'relative',
    height: '70vh',
    minHeight: 480,
  },
  mapOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '40px',
    background:
      'linear-gradient(to top, rgba(11,14,20,0.95), rgba(11,14,20,0.2))',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.6)',
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 42,
    margin: '6px 0',
  },
  meta: {
    color: '#c9d1ff',
    fontSize: 15,
  },

  /* BODY */
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
