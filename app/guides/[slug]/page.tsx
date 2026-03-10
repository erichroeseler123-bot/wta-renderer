import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { getGuideBySlug, guides } from "@/lib/content/guides";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) {
    return {
      title: "Guide Not Found | Welcome To Alaska Tours",
    };
  }
  const url = `https://welcometoalaskatours.com/guides/${guide.slug}`;
  return {
    title: `${guide.title} | Welcome To Alaska Tours`,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    mainEntityOfPage: `https://welcometoalaskatours.com/guides/${guide.slug}`,
    author: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
    },
    publisher: {
      "@type": "Organization",
      name: "Welcome To Alaska Tours",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <Link
          href="/guides"
          className="inline-flex rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
        >
          ← All guides
        </Link>

        <header className="mt-5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
            {guide.targetKeyword} • {guide.readMinutes} min read
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-base text-slate-600">{guide.description}</p>
          <div className="mt-3 text-xs text-slate-500">
            Updated {guide.updatedAt}
          </div>
        </header>

        <section className="mt-8 space-y-4 text-slate-700">
          <p>{guide.intro}</p>
        </section>

        <section className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-2xl font-black tracking-tight">{section.heading}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-2xl font-black tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-4 space-y-4">
            {guide.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                <p className="mt-1 text-sm text-slate-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="text-xl font-black tracking-tight">Ready to Book Your Port Day?</h2>
          <p className="mt-2 text-sm text-slate-700">
            Browse live departures and rates, then complete secure checkout in minutes.
          </p>
          <div className="mt-4">
            <Link
              href="/tours"
              className="inline-flex min-h-11 items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white"
            >
              Browse Alaska Tours
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
