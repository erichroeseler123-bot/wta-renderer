"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/tours.json').then(r => r.json()).then(d => {
      setTours(d);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-40 text-center text-8xl font-black italic animate-bounce">FILTERING...</div>;

  const categories = ["All", ...new Set(tours.map((t: any) => t.category))];
  const filtered = activeCat === "All" ? tours : tours.filter((t: any) => t.category === activeCat);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <header className="mb-16">
          <h1 className="text-6xl font-black text-slate-900 uppercase tracking-tighter mb-8">Juneau Excursions</h1>
          
          {/* CATEGORY TABS */}
          <div className="flex flex-wrap gap-3 border-b-2 border-slate-100 pb-8">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} 
                className={`px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest transition-all ${activeCat === cat ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map((tour: any) => (
            <Link key={tour.pk} href={`/tours/${tour.company}/${tour.pk}`} className="group flex flex-col">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 mb-6 border-2 border-transparent group-hover:border-blue-500 transition-all">
                <img src={tour.image || "/hero/hero5678.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{tour.category}</span>
                  <div className="text-2xl font-black text-slate-900">{tour.fromPrice}</div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-3 group-hover:text-blue-600">{tour.title}</h3>
                <p className="text-slate-500 text-sm italic line-clamp-2 leading-relaxed">"{tour.description}"</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
