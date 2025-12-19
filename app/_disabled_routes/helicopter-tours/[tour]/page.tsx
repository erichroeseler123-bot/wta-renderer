import { notFound } from "next/navigation";

const DCC_BASE = process.env.DCC_BASE_URL;

export default async function HelicopterTourPage({
  params,
}: {
  params: { slug: string; tour: string };
}) {
  const res = await fetch(`${DCC_BASE}/api/inventory/${params.slug}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const data = await res.json();

  const tour = data.tours.find(
    (t: any) => t.id === "demo-1" || params.tour === "icefield-excursion"
  );

  if (!tour) return notFound();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2rem" }}>
      <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>
        {tour.title}
      </h1>

      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Operated by {tour.operator}
      </p>

      <img
        src={tour.image}
        alt={tour.title}
        style={{
          width: "100%",
          borderRadius: 12,
          marginBottom: "2rem",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <strong>Duration</strong>
          <div>{tour.duration}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <strong>From</strong>
          <div style={{ fontSize: "1.4rem", color: "#0070f3" }}>
            ${tour.price_from}
          </div>
        </div>
      </div>

      <button
        style={{
          padding: "1rem 2rem",
          fontSize: "1rem",
          borderRadius: 8,
          border: "none",
          background: "#0070f3",
          color: "white",
          cursor: "pointer",
        }}
      >
        Check Availability
      </button>
    </main>
  );
}
