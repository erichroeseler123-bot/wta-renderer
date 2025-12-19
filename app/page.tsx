import FeaturedTours from './components/FeaturedTours.client';

const PORTS = [
  { slug: 'juneau', name: 'Juneau', subtitle: 'Glaciers, whales, helicopters' },
  { slug: 'skagway', name: 'Skagway', subtitle: 'Railway & Gold Rush history' },
  { slug: 'ketchikan', name: 'Ketchikan', subtitle: 'Rainforest & totems' },
  { slug: 'sitka', name: 'Sitka', subtitle: 'Wildlife & coastal culture' },
];

async function getFeaturedTours() {
  const res = await fetch(
    `${process.env.DCC_BASE_URL}/api/inventory/juneau`,
    { cache: 'no-store' }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return data.tours.map((t: any) => ({
    ...t,
    port: 'juneau',
  }));
}

export default async function HomePage() {
  const featuredTours = await getFeaturedTours();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Alaska Cruise Ports & Shore Excursions
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#555', maxWidth: 720 }}>
          Book trusted shore excursions designed to fit real cruise ship schedules.
        </p>
      </header>

      <FeaturedTours tours={featuredTours} />

      <section style={{ marginTop: '5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          Explore by Cruise Port
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {PORTS.map((port) => (
            <a
              key={port.slug}
              href={`/ports/${port.slug}`}
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: 12,
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <h3>{port.name}</h3>
              <p style={{ color: '#666' }}>{port.subtitle}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
