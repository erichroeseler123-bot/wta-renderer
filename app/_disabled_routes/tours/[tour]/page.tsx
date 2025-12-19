import { notFound } from 'next/navigation';

export default async function TourPage({
  params,
}: {
  params: { slug: string; tour: string };
}) {
  const res = await fetch(
    `${process.env.DCC_BASE_URL}/api/inventory/${params.slug}`,
    { cache: 'no-store' }
  );

  if (!res.ok) return notFound();

  const data = await res.json();
  const tour = data.tours.find((t: any) => t.id === params.tour);

  if (!tour) return notFound();

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.4rem' }}>{tour.title}</h1>

      <p style={{ marginTop: 8, color: '#555' }}>
        By {tour.operator}
      </p>

      <p style={{ marginTop: 16 }}>
        <strong>${tour.price_from}</strong> · {tour.duration}
      </p>

      <p style={{ marginTop: 24 }}>
        Departing from <strong>{data.portName}</strong>
      </p>

      {/* Checkout button comes next */}
    </main>
  );
}
