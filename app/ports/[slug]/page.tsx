export default async function PortPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Fetch from your own API instead of importing a missing file
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/fareharbor/items`, {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  const data = await res.json();
  const allTours = data.items || [];
  
  const portTours = allTours.filter((t: any) => 
    t.port?.toLowerCase().includes(slug.toLowerCase()) || 
    t.company?.toLowerCase().includes(slug.toLowerCase())
  );

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-4xl font-black uppercase mb-8">{slug} Adventures</h1>
      <div className="grid gap-8">
        {portTours.map((tour: any) => (
          <div key={tour.pk} className="border border-white/10 p-6 rounded-3xl bg-white/5">
             <img src={tour.image} className="w-full h-64 object-cover rounded-2xl" alt={tour.title} />
             <h2 className="text-3xl font-black mt-4">{tour.title}</h2>
             <p className="text-slate-400 mt-2">{tour.description}</p>
             <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold">{tour.fromPrice}</span>
                <a href={`/tours/${tour.company}/${tour.pk}`} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">
                  See Schedule →
                </a>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
