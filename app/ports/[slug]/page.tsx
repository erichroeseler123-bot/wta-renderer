import { notFound } from 'next/navigation';
import TourGrid from '../../components/TourGrid.client';

type Tour = {
  id: string;
  title: string;
  operator: string;
  price_from: number;
  duration: string;
  image?: string;
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
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    notFound();
  }

  const data: PortData = await res.json();

  // 🔒 HARD GUARD (prevents "UNDEFINED")
  if (!data || !data.portName) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {data.portName}
        </h1>
        <p style={{ color: '#666' }}>
          {data.tours.length} tour{data.tours.length !== 1 ? 's' : ''} available
        </p>
      </header>

      <TourGrid
        slug={params.slug}
        tours={data.tours}
      />
    </main>
  );
}
