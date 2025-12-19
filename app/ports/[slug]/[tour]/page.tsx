export default function TourPage({
  params,
}: {
  params: { slug: string; tour: string };
}) {
  return (
    <main style={{ padding: '4rem', maxWidth: 900, margin: '0 auto' }}>
      <h1>{params.tour.replace(/-/g, ' ')}</h1>
      <p>
        This tour departs from <strong>{params.slug}</strong>.
      </p>
      <p>
        Booking and availability powered by Welcome to Alaska Tours.
      </p>
    </main>
  );
}
