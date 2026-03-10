import JsonLd from "@/components/seo/JsonLd";
import { testimonials } from "@/lib/content/testimonials";

export default function TestimonialsSection({
  compact = false,
  includeOrganizationSchema = false,
}: {
  compact?: boolean;
  includeOrganizationSchema?: boolean;
}) {
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
  const avg = testimonials.length > 0 ? (total / testimonials.length).toFixed(1) : "5.0";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Welcome To Alaska Tours",
    url: "https://welcometoalaskatours.com",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg,
      reviewCount: String(testimonials.length),
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <section className={`${compact ? "py-8" : "py-12"} bg-white`}>
      {includeOrganizationSchema ? <JsonLd data={orgSchema} /> : null}
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">What Cruise Travelers Say</h2>
        <p className="mt-2 text-sm text-slate-600">
          Real feedback focused on tour timing, booking clarity, and port-day reliability.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, compact ? 3 : testimonials.length).map((t) => (
            <div key={`${t.name}-${t.date}-${t.quote}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-bold text-amber-600">{`${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}`}</div>
              <p className="mt-2 text-sm text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.name} • {t.location} • {t.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
