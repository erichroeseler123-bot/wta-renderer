import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { guides } from "@/lib/content/guides";

export default function GuidesIndexPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alaska Cruise Planning Guides",
    itemListElement: guides.map((guide, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: guide.title,
      url: `https://welcometoalaskatours.com/guides/${guide.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <JsonLd data={itemListSchema} />
      <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Alaska Cruise Planning Guides</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Long-tail planning content for Juneau, Skagway, Ketchikan, and independent shore excursion booking strategy.
          </p>
        </div>

        <div className="grid gap-4">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-200 hover:bg-white"
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                <span>{guide.targetKeyword}</span>
                <span className="text-slate-400">•</span>
                <span>{guide.readMinutes} min read</span>
                {guide.port ? (
                  <>
                    <span className="text-slate-400">•</span>
                    <span>{guide.port}</span>
                  </>
                ) : null}
              </div>
              <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">{guide.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{guide.description}</p>
              <div className="mt-3 text-sm font-bold text-slate-900">Read guide →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
