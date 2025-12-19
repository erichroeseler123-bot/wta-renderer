import { notFound } from 'next/navigation';
import TourGrid from '@/app/components/TourGrid.client';

type Tour = {
  id: string;
  title: string;
  operator: string;
  price_from: number;
  duration: string;
};

type PortData = {
  portName: string;
  tours: Tour[];
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

  if (!res.ok) return notFound();

  const data: PortData = await res.json();

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.6rem', marginBottom: '0.5rem' }}>
        {data.portName}
      </h1>

      <p style={{ color: '#666' }}>
        {data.tours.length} tour{data.tours.length !== 1 && 's'} available
      </p>

      <TourGrid slug={params.slug} tours={data.tours} />
    </main>
  );
}
