'use client';

import Link from 'next/link';

type Tour = {
  id: string;
  title: string;
  price_from: number;
  duration: string;
  image?: string;
  port: string;
};

export default function FeaturedTours({ tours }: { tours: Tour[] }) {
  if (!tours?.length) return null;

  return (
    <section style={{ margin: '4rem 0' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        Featured Shore Excursions
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {tours.map((tour) => (
          <Link
            key={tour.id}
            href={`/ports/${tour.port}/${tour.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: 12,
                padding: '1.25rem',
                background: '#fff',
              }}
            >
              <h3 style={{ marginBottom: '0.5rem' }}>{tour.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {tour.duration}
              </p>
              <strong>From ${tour.price_from}</strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
