import Link from "next/link";

export default function HelicopterToursPage({
  params,
}: {
  params: { slug: string };
}) {
  const port = params.slug.toUpperCase();

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>
        {port} Helicopter Tours
      </h1>

      <p style={{ color: "#555", marginBottom: "2rem" }}>
        Scenic helicopter excursions designed to fit cruise ship schedules.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <Link
          href={`/ports/${params.slug}/helicopter-tours/icefield-excursion`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: "1.5rem",
            }}
          >
            <h3>Icefield Helicopter Excursion</h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Glacier landings, icefields, and alpine views.
            </p>
          </div>
        </Link>
      </section>
    </main>
  );
}
