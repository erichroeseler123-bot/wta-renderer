import Link from 'next/link';

const PORTS = [
  {
    slug: 'juneau',
    name: 'Juneau',
    subtitle: 'Glaciers, whales, helicopter tours',
  },
  {
    slug: 'skagway',
    name: 'Skagway',
    subtitle: 'White Pass Railway & gold rush history',
  },
  {
    slug: 'ketchikan',
    name: 'Ketchikan',
    subtitle: 'Totem poles & rainforest adventures',
  },
  {
    slug: 'sitka',
    name: 'Sitka',
    subtitle: 'Wildlife & Russian heritage',
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '4rem 2rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>
          Alaska Cruise Ports & Shore Excursions
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#555', maxWidth: 700 }}>
          Explore shore excursions by port of call. Each port page shows
          curated tours designed to fit cruise ship schedules.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {PORTS.map((port) => (
          <Link
            key={port.slug}
            href={`/ports/${port.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="port-card">
              <h2 style={{ marginBottom: '0.5rem' }}>{port.name}</h2>
              <p style={{ color: '#666', fontSize: '0.95rem' }}>
                {port.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {/* Inline CSS for hover (legal in Server Components) */}
      <style>{`
        .port-card {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 1.5rem;
          height: 100%;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .port-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
      `}</style>
    </main>
  );
}
