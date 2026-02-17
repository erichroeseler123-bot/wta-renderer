import Link from 'next/link';
import { getToursFromFareHarbor } from '@/lib/data/tours';

export default async function Home() {
  // Fetch the 125 live tours from all 21 companies
  const allTours = await getToursFromFareHarbor();

  const ports = [
    { 
      name: 'Juneau', 
      image: '🏔️', 
      count: allTours.filter(t => t.port?.toLowerCase().includes('juneau') || t.fareharbor.company.includes('juneau')).length 
    },
    { 
      name: 'Skagway', 
      image: '🚂', 
      count: allTours.filter(t => t.port?.toLowerCase().includes('skagway') || t.fareharbor.company.includes('skagway')).length 
    },
    { 
      name: 'Ketchikan', 
      image: '🌲', 
      count: allTours.filter(t => t.port?.toLowerCase().includes('ketchikan') || t.fareharbor.company.includes('ketchikan')).length 
    },
  ];

  return (
    <main className="bg-white min-h-screen">
      <section className="relative py-24 bg-[#0F172A] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-6xl font-black tracking-tighter mb-6 uppercase leading-none">
            Alaskan Shore <span className="text-blue-500">Excursions</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 font-medium">
            Live Inventory from 21 Operators. 100% Back-to-Ship Guarantee.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/tours" className="bg-indigo-700 px-8 py-4 rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-indigo-700/20 hover:bg-blue-500 transition-all">
              Browse All {allTours.length} Tours
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-slate-900 mb-12 uppercase tracking-tighter text-center">Browse by Port</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ports.map((port) => (
            <Link key={port.name} href={`/tours?port=${port.name.toLowerCase()}`} className="group relative overflow-hidden rounded-3xl bg-slate-100 p-10 hover:bg-white hover:shadow-2xl transition-all border border-slate-200">
              <span className="text-6xl mb-6 block">{port.image}</span>
              <h3 className="text-2xl font-black text-slate-900 uppercase">{port.name}</h3>
              <p className="text-slate-500 font-bold">{port.count} Tours Available →</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
