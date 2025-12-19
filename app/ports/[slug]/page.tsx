import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Tour {
  id: string;
  title: string;
  operator: string;
  price_from: number;
  duration: string;
  image?: string;
}

interface PortData {
  portName: string;
  tours: Tour[];
}

export default async function PortPage({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(
    `${process.env.DCC_BASE_URL}/api/inventory/${params.slug}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    return notFound();
  }

  const data: PortData = await res.json();

  if (!data || !data.tours || data.tours.length === 0) {
    return notFound();
  }

  return (
    <main style={{ padding: '4rem', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>{data.portName}</h1>
        <p>{data.tours.length} tours available</p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {data.tours.map((tour) => (
          <Link
            key={tour.id}
            href={`/ports/${params.slug}/${tour.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 12,
                padding: '1.5rem',
              }}
            >
              <h3>{tour.title}</h3>
              <p>By {tour.operator}</p>
              <p>
                <strong>${tour.price_from}</strong> · {tour.duration}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
