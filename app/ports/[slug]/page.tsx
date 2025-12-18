export default async function PortPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ padding: '40px' }}>
      <h1>Welcome to Alaska</h1>
      <p><strong>Port:</strong> {params.slug}</p>
      <p>Status: LIVE NEXT.JS ROUTE</p>
    </main>
  );
}
