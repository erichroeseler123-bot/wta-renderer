import { notFound } from 'next/navigation';

export default function TourPage({
  params,
}: {
  params?: { slug?: string; tour?: string };
}) {
  if (!params?.slug || !params?.tour) {
    return notFound();
  }

  const title = params.tour.split('-').join(' ');

  return (
    <main
      style={{
        padding: '4rem',
        maxWidth: 900,
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>
        {title}
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#555' }}>
        Departing from <strong>{params.slug}</strong>, Alaska
      </p>

      <hr style={{ margin: '2rem 0' }} />

      <p>
        This excursion is operated by trusted local partners and booked
        through <strong>Welcome to Alaska Tours</strong>.
      </p>

      <p>
        Real-time availability, pricing, and checkout are powered by our
        secure booking system.
      </p>
    </main>
  );
}

