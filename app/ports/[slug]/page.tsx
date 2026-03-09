import Link from "next/link";
import { inferPortFromCompany } from "@/lib/handoff/mappings";

type Tour = {
  pk: number;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  company: string;
  fromPrice?: string;
  category?: string;
};

function normalize(v: string) {
  return String(v || "").trim().toLowerCase();
}

function sameCategory(tourCategory: string | undefined, wanted: string) {
  if (!wanted) return true;
  const a = normalize(tourCategory || "").replace(/\s+/g, "-");
  const b = normalize(wanted).replace(/\s+/g, "-");
  return a === b || a.replace(/-/g, "") === b.replace(/-/g, "");
}

function titleCase(s: string) {
  return s
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function PortPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = typeof sp.category === "string" ? sp.category : "";
  const date = typeof sp.date === "string" ? sp.date : "";
  const partySize = typeof sp.partySize === "string" ? sp.partySize : "";
  const adults = typeof sp.adults === "string" ? sp.adults : "";
  const children = typeof sp.children === "string" ? sp.children : "";
  const cruiseShip = typeof sp.cruiseShip === "string" ? sp.cruiseShip : "";
  const timeOfDay = typeof sp.timeOfDay === "string" ? sp.timeOfDay : "";
  const budgetTier = typeof sp.budgetTier === "string" ? sp.budgetTier : "";
  const source = typeof sp.source === "string" ? sp.source : "";
  const handoffId = typeof sp.handoff_id === "string" ? sp.handoff_id : "";

  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.SITE_URL || "http://localhost:3000";
  const res = await fetch(`${base.replace(/\/+$/, "")}/api/tours/list`, {
    next: { revalidate: 3600 },
  });

  const data = await res.json().catch(() => ({}));
  const allTours: Tour[] = Array.isArray(data?.tours) ? data.tours : [];

  const portTours = allTours.filter((t) => {
    const port = inferPortFromCompany(t.company);
    if (normalize(port || "") !== normalize(slug)) return false;
    if (!sameCategory(t.category, category)) return false;
    return true;
  });

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-black uppercase mb-4">{titleCase(slug)} Adventures</h1>

      {(source || handoffId || category || date || partySize || cruiseShip) ? (
        <div className="mb-8 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
          {source ? <span className="rounded-full bg-blue-500/20 text-blue-300 px-3 py-1">Source {source}</span> : null}
          {handoffId ? <span className="rounded-full bg-blue-500/20 text-blue-300 px-3 py-1">Handoff {handoffId}</span> : null}
          {category ? <span className="rounded-full bg-white/10 px-3 py-1">Category {category}</span> : null}
          {date ? <span className="rounded-full bg-white/10 px-3 py-1">Date {date}</span> : null}
          {partySize ? <span className="rounded-full bg-white/10 px-3 py-1">Party {partySize}</span> : null}
          {adults ? <span className="rounded-full bg-white/10 px-3 py-1">Adults {adults}</span> : null}
          {children ? <span className="rounded-full bg-white/10 px-3 py-1">Children {children}</span> : null}
          {cruiseShip ? <span className="rounded-full bg-white/10 px-3 py-1">Ship {cruiseShip}</span> : null}
          {timeOfDay ? <span className="rounded-full bg-white/10 px-3 py-1">Time {timeOfDay}</span> : null}
          {budgetTier ? <span className="rounded-full bg-white/10 px-3 py-1">Budget {budgetTier}</span> : null}
        </div>
      ) : null}

      {!portTours.length ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">No tours matched this port/filter yet.</div>
          <Link href="/tours" className="mt-4 inline-block text-blue-300 font-semibold">View all tours</Link>
        </div>
      ) : (
        <div className="grid gap-8">
          {portTours.map((tour) => {
            const nextSp = new URLSearchParams();
            if (date) nextSp.set("date", date);
            if (partySize) nextSp.set("partySize", partySize);
            if (adults) nextSp.set("adults", adults);
            if (children) nextSp.set("children", children);
            if (cruiseShip) nextSp.set("cruiseShip", cruiseShip);
            if (source) nextSp.set("source", source);
            if (handoffId) nextSp.set("handoff_id", handoffId);

            const href = `/tours/${tour.company}/${tour.pk}${nextSp.toString() ? `?${nextSp.toString()}` : ""}`;

            return (
              <div key={`${tour.company}:${tour.pk}`} className="border border-white/10 p-6 rounded-3xl bg-white/5">
                <img src={tour.image || "/hero/hero5678.jpg"} className="w-full h-64 object-cover rounded-2xl" alt={tour.title} />
                <h2 className="text-3xl font-black mt-4">{tour.title}</h2>
                <p className="text-slate-400 mt-2">{tour.description || ""}</p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-2xl font-bold">{tour.fromPrice || "Check Price"}</span>
                  <Link href={href} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">
                    See Schedule →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
