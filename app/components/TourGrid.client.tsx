'use client';

import Link from 'next/link';

type Tour = {
  id: string;
  title: string;
  operator: string;
  price_from: number;
  duration: string;
};

export default function TourGrid({
  slug,
  tours,
}: {
  slug: string;
  tours: Tour[];
}) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
      }}
    >
      {tours.map((tour) => (
        <Link
          key={tour.id}
          href={`/ports/${slug}/tours/${tour.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: 12,
              padding: '1.25rem',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{ marginBottom: 6 }}>{tour.title}</h3>
            <p style={{ fontSize: 14, color: '#555' }}>
              By {tour.operator}
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>From ${tour.price_from}</strong> · {tour.duration}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
