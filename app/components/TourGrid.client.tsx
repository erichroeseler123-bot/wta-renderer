'use client';

import Link from 'next/link';

type Tour = {
  id: string;
  title: string;
  operator?: string;
  price_from?: number;
  duration?: string;
};

export default function TourGrid({
  tours,
  port,
}: {
  tours: Tour[];
  port: string;
}) {
  if (!tours || tours.length === 0) {
    return <p>No tours available.</p>;
  }

  return (
    <div
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
          href={`/ports/${port}/${tour.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: 12,
              padding: '1.25rem',
              background: '#fff',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              height: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{ marginBottom: '0.5rem' }}>{tour.title}</h3>

            {tour.operator && (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                By {tour.operator}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {tour.duration && <span>{tour.duration}</span>}
              {tour.price_from && (
                <strong>${tour.price_from.toFixed(0)}</strong>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
