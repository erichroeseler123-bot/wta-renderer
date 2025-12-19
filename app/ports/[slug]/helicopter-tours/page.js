import DCCRotatingMap from '../../components/DCCRotatingMap';
export default async function Page({ params }) {
  const { slug } = await params;

  const tours = [
    {
      slug: 'glacier-landing',
      title: 'Glacier Landing Helicopter Tour',
      duration: 'Approx. 30 minutes',
      highlights: 'Land on a glacier • Alpine views • Ice fields',
    },
    {
      slug: 'extended-glacier',
      title: 'Extended Glacier Experience',
      duration: 'Approx. 60 minutes',
      highlights: 'Multiple glaciers • Longer flight • Remote terrain',
    },
    {
      slug: 'icefield-explorer',
      title: 'Icefield Explorer',
      duration: 'Approx. 90 minutes',
      highlights: 'Massive icefields • Deep wilderness • Premium flight',
    },
  ];

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span style={styles.badge}>Operated by Coastal Helicopters</span>
          <h1 style={styles.title}>
            {slug.charAt(0).toUpperCase() + slug.slice(1)} Helicopter Tours
          </h1>
          <p style={styles.meta}>
            Glacier landings • Icefields • Aerial Alaska
          </p>
        </div>
      </section>
      <DCCRotatingMap slug={slug} />

      {/* GRID */}
      <section style={styles.body}>
        <div style={styles.grid}>
          {tours.map((t) => (
            <a
              key={t.slug}
              href={`/ports/${slug}/helicopter-tours/${t.slug}`}
              style={styles.card}
            >
              <h3>{t.title}</h3>
              <p style={styles.cardMeta}>{t.duration}</p>
              <p>{t.highlights}</p>
            </a>
          ))}
        </div>
      </section>
      <DCCRotatingMap slug={slug} />
    </main>
  );
}

const styles = {
  page: {
    background: '#0b0e14',
    color: '#e6e9ef',
    minHeight: '100vh',
  },

  /* HERO */
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
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    margin: '10px 0',
  },
  meta: {
    color: '#c9d1ff',
    fontSize: 16,
  },

  /* BODY */
  body: {
    padding: '40px',
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
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardMeta: {
    color: '#9aa4bf',
    fontSize: 14,
    marginBottom: 6,
  },
};
