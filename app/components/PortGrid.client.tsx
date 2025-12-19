'use client';

import Link from 'next/link';

type Port = {
  slug: string;
  name: string;
  image: string;
};

export default function PortGrid({ ports }: { ports: Port[] }) {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem'
      }}
    >
      {ports.map((port) => (
        <Link
          key={port.slug}
          href={`/ports/${port.slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#111',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <img
              src={port.image}
              alt={port.name}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>{port.name}</h3>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
