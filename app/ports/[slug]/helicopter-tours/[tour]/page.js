import DCCRotatingMap from '../../../components/DCCRotatingMap';
export default async function Page({ params }) {
  const { slug, tour } = await params;

  const tours = {
    'glacier-landing': {
      title: 'Glacier Landing Helicopter Tour',
      duration: 'Approx. 30 minutes',
      description:
        'Fly over Juneau’s icefields and land directly on a glacier for an unforgettable Arctic experience.',
    },
    'extended-glacier': {
      title: 'Extended Glacier Experience',
      duration: 'Approx. 60 minutes',
      description:
        'A longer flight covering multiple glaciers and deeper wilderness areas.',
    },
    'icefield-explorer': {
      title: 'Icefield Explorer',
      duration: 'Approx. 90 minutes',
      description:
        'Our most immersive flight, exploring vast icefields and remote alpine terrain.',
    },
  };

  const data = tours[tour];

  if (!data) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Tour not found</h1>
      </main>
    );
  }

  const bookingUrl = 'https://fareharbor.com/embeds/book/coastalhelicopters/';

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span style={styles.badge}>Operated by Coastal Helicopters</span>
          <h1 style={styles.title}>{data.title}</h1>
          <p style={styles.meta}>
            {data.duration} • Juneau, Alaska
          </p>
        </div>
      </section>
      <DCCRotatingMap slug={slug} />

      {/* BODY */}
      <section style={styles.body}>
        <p style={styles.description}>{data.description}</p>

        <div style={styles.cta}>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.button}
          >
            Book Helicopter Tour
          </a>
          <p style={styles.note}>
            Live availability • Secure checkout via FareHarbor
          </p>
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
  hero: {
    position: 'relative',
    height: '60vh',
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
      'linear-gradient(to bottom, rgba(11,14,20,0.2), rgba(11,14,20,0.95))',
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
  body: {
    maxWidth: 820,
    margin: '0 auto',
    padding: '40px',
  },
  description: {
    fontSize: 18,
    lineHeight: 1.6,
  },
  cta: {
    marginTop: 40,
  },
  button: {
    display: 'inline-block',
    background: '#f5c77a',
    color: '#000',
    padding: '16px 28px',
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 600,
    textDecoration: 'none',
    boxShadow: '0 10px 30px rgba(245,199,122,0.25)',
  },
  note: {
    marginTop: 10,
    fontSize: 12,
    color: '#9aa4bf',
  },
};
