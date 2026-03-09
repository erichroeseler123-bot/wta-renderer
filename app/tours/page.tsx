"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function normalize(s: string) {
  return String(s || "").trim().toLowerCase();
}

function matchCategory(input: string, categories: string[]) {
  const n = normalize(input);
  if (!n) return "";

  const exact = categories.find((c) => normalize(c) === n);
  if (exact) return exact;

  const deSlug = n.replace(/-/g, " ");
  const loose = categories.find((c) => normalize(c).replace(/-/g, " ") === deSlug);
  return loose || "";
}

export default function ToursPage() {
  const sp = useSearchParams();

  const [tours, setTours] = useState<Tour[]>([]);
  const [manualCat, setManualCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const portFilter = normalize(sp.get("port") || "");
  const categoryFilterRaw = sp.get("category") || "";
  const handoffId = sp.get("handoffId") || "";
  const party = sp.get("party") || "";
  const date = sp.get("date") || "";

  useEffect(() => {
    fetch("/data/tours.json")
      .then((r) => r.json())
      .then((d) => {
        setTours(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setTours([]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(tours.map((t) => t.category || "Adventures"))],
    [tours],
  );

  const queryCategory = useMemo(
    () => matchCategory(categoryFilterRaw, categories),
    [categoryFilterRaw, categories],
  );
  const activeCat = manualCat ?? (queryCategory || "All");

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const tPort = inferPortFromCompany(t.company);
      if (portFilter && tPort !== portFilter) return false;

      if (activeCat !== "All" && (t.category || "Adventures") !== activeCat) return false;

      return true;
    });
  }, [tours, portFilter, activeCat]);

  const heading = portFilter ? `${portFilter[0].toUpperCase()}${portFilter.slice(1)} Excursions` : "Alaska Excursions";

  if (loading) return <div className="p-40 text-center text-8xl font-black italic animate-bounce">FILTERING...</div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <header className="mb-16">
          <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">{heading}</h1>

          {(handoffId || date || party) ? (
            <div className="mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
              {handoffId ? <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1">DCC Handoff</span> : null}
              {date ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">Date {date}</span> : null}
              {party ? <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1">Party {party}</span> : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-b-2 border-slate-100 pb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setManualCat(cat)}
                className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${
                  activeCat === cat
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map((tour) => (
            <Link key={`${tour.company}:${tour.pk}`} href={`/tours/${tour.company}/${tour.pk}`} className="group flex flex-col">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 mb-6 border-2 border-transparent group-hover:border-blue-500 transition-all">
                <img src={tour.image || "/hero/hero5678.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={tour.title} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{tour.category || "Adventures"}</span>
                  <div className="text-2xl font-black text-slate-900">{tour.fromPrice || "Check Price"}</div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 group-hover:text-blue-600">{tour.title}</h3>
                <p className="text-slate-500 text-sm italic line-clamp-2 leading-relaxed">{tour.description || ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
