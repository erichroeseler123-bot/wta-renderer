import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { guides } from "@/lib/content/guides";

function firstParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] || "") : (v || "");
}

function withFilters(port: string, topic: string, q: string) {
  const sp = new URLSearchParams();
  if (port && port !== "all") sp.set("port", port);
  if (topic && topic !== "all") sp.set("topic", topic);
  if (q.trim()) sp.set("q", q.trim());
  const qs = sp.toString();
  return qs ? `/guides?${qs}` : "/guides";
}

export default async function GuidesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const port = firstParam(sp.port).toLowerCase() || "all";
  const topic = firstParam(sp.topic).toLowerCase() || "all";
  const q = firstParam(sp.q).trim().toLowerCase();

  const portOptions = ["all", "juneau", "skagway", "ketchikan"];
  const topicOptions = ["all", ...new Set(guides.map((g) => g.topic))];

  const filtered = guides.filter((guide) => {
    if (port !== "all" && guide.port !== port) return false;
    if (topic !== "all" && guide.topic !== topic) return false;
    if (q) {
      const hay = `${guide.title} ${guide.description} ${guide.targetKeyword}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Alaska Cruise Planning Guides",
    itemListElement: filtered.map((guide, index) => ({
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

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Port</div>
              <div className="flex flex-wrap gap-2">
                {portOptions.map((v) => (
                  <Link
                    key={v}
                    href={withFilters(v, topic, q)}
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      port === v ? "bg-sky-600 text-white" : "bg-white text-slate-700 border border-slate-300"
                    }`}
                  >
                    {v}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Topic</div>
              <div className="flex flex-wrap gap-2">
                {topicOptions.map((v) => (
                  <Link
                    key={v}
                    href={withFilters(port, v, q)}
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      topic === v ? "bg-sky-600 text-white" : "bg-white text-slate-700 border border-slate-300"
                    }`}
                  >
                    {v}
                  </Link>
                ))}
              </div>
            </div>
            <form method="get" action="/guides" className="flex items-end gap-2">
              {port !== "all" ? <input type="hidden" name="port" value={port} /> : null}
              {topic !== "all" ? <input type="hidden" name="topic" value={topic} /> : null}
              <label className="block w-full text-xs font-bold uppercase tracking-wide text-slate-500">
                Search
                <input
                  name="q"
                  defaultValue={q}
                  className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="whale watching, budget, juneau..."
                />
              </label>
              <button
                type="submit"
                className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
              >
                Apply
              </button>
            </form>
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-600">
            Showing {filtered.length} guide{filtered.length === 1 ? "" : "s"}.
            {" "}
            <Link href="/guides" className="text-sky-700 hover:underline">Reset filters</Link>
          </div>
        </div>

        <div className="grid gap-4">
          {filtered.map((guide) => (
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
                <span className="text-slate-400">•</span>
                <span>{guide.topic}</span>
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
