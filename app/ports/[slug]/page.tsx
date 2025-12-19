import { notFound } from 'next/navigation';

type Tour = {
  id: string;
  title: string;
  operator: string;
  price_from: number;
  duration: string;
  image: string;
};

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

  const data: { portName: string; tours: Tour[] } = await res.json();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
        {data.portName}
      </h1>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
        }}
      >
        {data.tours.map((tour) => (
          <a
            key={tour.id}
            href={`/ports/${params.slug}/${tour.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #ddd',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <img
              src={tour.image}
              alt={tour.title}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem' }}>
              <h3>{tour.title}</h3>
              <p>{tour.operator}</p>
              <strong>${tour.price_from}</strong>
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}
