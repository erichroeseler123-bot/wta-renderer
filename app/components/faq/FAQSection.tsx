import JsonLd from "@/components/seo/JsonLd";

export type FAQItem = {
  question: string;
  answer: string;
};

export default function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
  includeSchema = true,
}: {
  faqs: FAQItem[];
  title?: string;
  includeSchema?: boolean;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <section className="py-12 bg-slate-50">
      {includeSchema ? <JsonLd data={schema} /> : null}
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white">
              <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-slate-900 sm:text-base">
                {faq.question}
              </summary>
              <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-700">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
