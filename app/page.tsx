import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO SECTION - NO ICONS */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <img 
          src="/hero/hero5678.jpg" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Alaska Landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-white" />
        
        <div className="relative z-10 text-center px-6">
          <h1 className="text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl">
            Welcome <span className="text-blue-500">To</span> Alaska
          </h1>
          <p className="text-2xl text-white font-bold uppercase tracking-widest mb-12 drop-shadow-lg">
            Direct-To-Operator Port Excursions
          </p>
          <Link href="/tours" className="inline-block bg-blue-600 text-white px-12 py-5 rounded-full font-black text-xl uppercase tracking-tighter hover:bg-blue-700 transition-all shadow-2xl hover:scale-105">
            View All Juneau Tours →
          </Link>
        </div>
      </section>

      {/* PORT CATEGORIES - PHOTOGRAPHY DRIVEN */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Juneau', img: '/hero/juneau.jpg' },
            { name: 'Skagway', img: '/hero/skagway.jpg' },
            { name: 'Ketchikan', img: '/hero/ketchikan.png' }
          ].map((port) => (
            <Link key={port.name} href={`/tours?port=${port.name.toLowerCase()}`} className="group relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
              <img src={port.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={port.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10">
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{port.name}</h3>
                <p className="text-blue-400 font-bold uppercase text-xs tracking-widest mt-2">Explore Tours →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
