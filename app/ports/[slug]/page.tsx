import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getHelicopterTours } from "@/lib/helicopterTours";
import { getProductOneLiner } from "@/lib/tourSeo";
import { CRUISE_ITINERARY_HINTS, type CruiseShipName } from "@/lib/cruiseShips";
import { parseTimeToMinutes } from "@/lib/timing";

const APPROVED_PORTS = ["juneau", "skagway", "ketchikan"];

const PORT_INFO: Record<string, { title: string; description: string; problem: string }> = {
  juneau: {
    title: "Juneau Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Compare Juneau whale watching, glacier, dog sledding, flightseeing, and active shore excursions for your cruise day.",
    problem: "Juneau has a large excursion menu, so the challenge is choosing the experience that fits your group, budget, and time in port without turning the day into a spreadsheet.",
  },
  skagway: {
    title: "Skagway Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Compare Skagway helicopter, dog sledding, scooter, and active shore excursions for your cruise day.",
    problem: "Skagway has a mix of structured departures and self-directed experiences. The best choice depends on how much of your port day you want to commit and how active you want the day to feel.",
  },
  ketchikan: {
    title: "Ketchikan Cruise Port Excursions | Welcome To Alaska Tours",
    description: "Compare Ketchikan rainforest, wildlife, kayak, flightseeing, fishing, and wilderness shore excursions.",
    problem: "Ketchikan offers everything from quick downtown-friendly experiences to remote wilderness trips. The best choice depends on weather tolerance, activity level, budget, and available port time.",
  },
};

const MONEY_LINKS: Record<string, Array<{ href: string; title: string; text: string }>> = {
  juneau: [
    { href: "/juneau/whale-watching", title: "Whale watching", text: "Compare small-boat, sightseeing and glacier-combination whale tours." },
    { href: "/juneau/mendenhall-glacier-tours", title: "Mendenhall Glacier", text: "Sightseeing, paddling, hiking and combination excursions." },
    { href: "/juneau/helicopter-tours", title: "Helicopter tours", text: "Glacier landings, trekking and scenic flightseeing." },
    { href: "/juneau/dog-sledding", title: "Dog sledding", text: "Summer camps and helicopter-accessed glacier dog experiences." },
    { href: "/juneau/fishing", title: "Fishing charters", text: "Salmon, halibut, combination trips and private charters." },
  ],
  ketchikan: [
    { href: "/ketchikan/bear-tours", title: "Bear tours", text: "Rainforest, remote viewing and flightseeing bear experiences." },
    { href: "/ketchikan/misty-fjords", title: "Misty Fjords", text: "Flightseeing and expedition-style ways to see the monument." },
    { href: "/ketchikan/kayaking", title: "Kayaking & canoe", text: "Sea kayaking, canoe and paddling excursions." },
    { href: "/ketchikan/adventure-tours", title: "Adventure tours", text: "UTVs, Jeeps, ziplines, kayaks, snorkeling and more active days." },
  ],
  skagway: [
    { href: "/skagway/helicopter-tours", title: "Helicopter tours", text: "Glacier-focused flightseeing and landing experiences." },
    { href: "/skagway/gold-rush-tours", title: "Gold Rush tours", text: "Liarsville, history, salmon bake and Gold Rush-themed experiences." },
    { href: "/skagway/dog-sledding", title: "Dog sledding", text: "Helicopter-accessed glacier dog experiences." },
    { href: "/skagway/adventure-tours", title: "Adventure tours", text: "Scooters, glacier flights and active port-day options." },
  ],
};

function priceDollars(value?: string) {
  const match = String(value || "").match(/\$\s*([0-9,]+)/);
  if (!match) return null;
  const dollars = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(dollars) ? dollars : null;
}

function adultPrice(value?: string) {
  const match = String(value || "").match(/\bAdult\s*[:|-]?\s*\$\s*([0-9][0-9,]*)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function durationHours(description?: string) {
  const text = String(description || "");
  const match = text.match(/\b(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(?:\d+(?:\.\d+)?\s*)?Hours?\b/i);
  return match ? Number(match[1]) : 0;
}

function searchable(tour: { title: string; description?: string; category?: string }) {
  return `${tour.title} ${tour.description || ""} ${tour.category || ""}`.toLowerCase();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!APPROVED_PORTS.includes(slug)) return {};
  const info = PORT_INFO[slug];
  return { title: info.title, description: info.description, alternates: { canonical: `https://welcometoalaskatours.com/ports/${slug}` } };
}

export default async function PortPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  if (!APPROVED_PORTS.includes(slug)) notFound();

  const resolvedSearch = await searchParams;
  const getParam = (value: string | string[] | undefined) => Array.isArray(value) ? String(value[0] || "") : String(value || "");
  const cookieStore = await cookies();
  const intentCookie = cookieStore.get("wta_dcc_intent");
  let dccIntent: any = null;
  if (intentCookie?.value) { try { dccIntent = JSON.parse(intentCookie.value); } catch {} }

  const cookieShip = dccIntent?.shipName || "";
  const cookiePort = dccIntent?.port || "";
  const isPortMatch = !cookiePort || cookiePort.toLowerCase() === slug.toLowerCase();
  const cruiseShip = getParam(resolvedSearch.cruiseShip) || (isPortMatch ? cookieShip : "");
  const info = PORT_INFO[slug];
  const portTitle = slug.charAt(0).toUpperCase() + slug.slice(1);

  let shipArrival = getParam(resolvedSearch.arrivalTime) || undefined;
  let shipDeparture = getParam(resolvedSearch.departureTime) || undefined;
  let shipWindow = shipArrival && shipDeparture ? `${shipArrival} - ${shipDeparture}` : undefined;

  if (!shipArrival && !shipDeparture && cruiseShip && CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]) {
    const hint = CRUISE_ITINERARY_HINTS[cruiseShip as CruiseShipName]!;
    if (hint.portSlug === slug) {
      const windowMatch = hint.window.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
      if (windowMatch) { shipArrival = windowMatch[1]; shipDeparture = windowMatch[2]; shipWindow = hint.window; }
    }
  }

  const allTours = await getHelicopterTours().catch(() => []);
  const portTours = allTours.filter((tour) => tour.port === slug);
  const evaluatedTours = portTours.map((tour) => {
    const hours = durationHours(tour.description);
    const durationMinutes = Math.round(hours * 60);
    let timingStatus: "fits" | "tight" | "unknown" = "unknown";
    let timingGuidanceText = "Check the tour calendar against your ship's actual all-aboard time.";
    if (shipArrival && shipDeparture && durationMinutes > 0) {
      const arrMin = parseTimeToMinutes(shipArrival);
      const depMin = parseTimeToMinutes(shipDeparture);
      if (arrMin !== null && depMin !== null) {
        const usableWindow = depMin - arrMin - 120;
        if (usableWindow >= durationMinutes) { timingStatus = "fits"; timingGuidanceText = "The listed duration appears workable within this port window, subject to the actual departure time and meeting details."; }
        else { timingStatus = "tight"; timingGuidanceText = "The listed duration looks tight for this port window. Verify the exact departure and return time before booking."; }
      }
    }
    return { ...tour, hours, timingStatus, timingGuidanceText };
  });

  const firstTimerTerms: Record<string, string[]> = {
    juneau: ["whale", "mendenhall", "glacier", "best of juneau", "dog sled"],
    skagway: ["glacier", "dog sled", "gold rush"],
    ketchikan: ["misty fjords", "rainforest", "totem", "duck tour", "bear", "kayak"],
  };

  const groups = [
    { title: "Best for first-time visitors", blurb: `A fast starting point if this is your first cruise stop in ${portTitle}.`, tours: evaluatedTours.filter((tour) => firstTimerTerms[slug].some((term) => searchable(tour).includes(term))).slice(0, 6) },
    { title: "Under $200", blurb: "Lower-cost choices that still feel like a real Alaska port-day experience.", tours: evaluatedTours.filter((tour) => { const price = priceDollars(tour.fromPrice); return price !== null && price < 200; }).sort((a, b) => (priceDollars(a.fromPrice) || 99999) - (priceDollars(b.fromPrice) || 99999)).slice(0, 6) },
    { title: "Wildlife", blurb: "Whales, bears, rainforest wildlife, and marine-life experiences.", tours: evaluatedTours.filter((tour) => /(whale|bear|wildlife|orca|salmon)/i.test(searchable(tour))).slice(0, 6) },
    { title: "Bucket-list Alaska", blurb: "The big-ticket, tell-everyone-about-it experiences.", tours: evaluatedTours.filter((tour) => /(helicopter|dog sled|flightseeing|seaplane|misty fjords|glacier|bear viewing)/i.test(searchable(tour))).sort((a, b) => (priceDollars(b.fromPrice) || 0) - (priceDollars(a.fromPrice) || 0)).slice(0, 6) },
    { title: "Families & easier days", blurb: "Experiences that read as broadly accessible, all-ages, scenic, or less strenuous in the operator descriptions.", tours: evaluatedTours.filter((tour) => /(all ages|family|visitor center|salmon bake|duck tour|wildlife sanctuary|sightseeing|lighthouse|feast)/i.test(searchable(tour))).slice(0, 6) },
    { title: "Shorter port-day options", blurb: "Useful when you do not want one excursion to consume the entire stop.", tours: evaluatedTours.filter((tour) => tour.hours > 0 && tour.hours <= 3.5).sort((a, b) => a.hours - b.hours).slice(0, 6) },
    { title: "Premium & private", blurb: "Private charters and premium experiences for groups willing to spend more for exclusivity.", tours: evaluatedTours.filter((tour) => /private|charter/i.test(searchable(tour)) || (priceDollars(tour.fromPrice) || 0) >= 700).sort((a, b) => (priceDollars(b.fromPrice) || 0) - (priceDollars(a.fromPrice) || 0)).slice(0, 6) },
  ].filter((group) => group.tours.length > 0);

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearch)) if (typeof value === "string" && value) qs.set(key, value);
  if (!qs.get("port")) qs.set("port", slug);
  if (!qs.get("intent")) qs.set("intent", "best-for");
  if (!qs.get("topic")) qs.set("topic", "shore-excursions");

  const TourCard = ({ tour }: { tour: (typeof evaluatedTours)[number] }) => {
    const tourQs = new URLSearchParams(qs.toString());
    tourQs.set("productSlug", tour.slug);
    const adult = adultPrice(tour.description);
    const lowest = priceDollars(tour.fromPrice);
    return (
      <Link href={`/tours/${tour.company}/${tour.pk}?${tourQs.toString()}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="aspect-[16/10] overflow-hidden bg-slate-100"><img src={tour.image || (slug === "juneau" ? "/hero/juneau.jpg" : slug === "skagway" ? "/hero/skagway.jpg" : "/hero/ketchikan.png")} alt={tour.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" /></div>
        <div className="p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-700">{tour.category || `${portTitle} excursion`}</div>
          <h3 className="mt-1 text-base font-black leading-snug text-slate-950">{tour.title}</h3>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{getProductOneLiner(tour)}</p>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between gap-3"><span className="font-black text-slate-950">{adult ? `Adult $${adult.toLocaleString()}` : (tour.fromPrice || "Check price")}</span><span className="text-xs font-bold text-sky-700">View tour →</span></div>
            {adult && lowest && lowest < adult ? <div className="mt-1 text-[10px] font-semibold text-slate-500">Lowest listed rate ${lowest.toLocaleString()}</div> : null}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/ports" className="inline-flex rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50">Back to ports</Link>

        <section className="relative mt-6 overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-lg">
          <div className="absolute inset-0"><img src={slug === "juneau" ? "/hero/juneau.jpg" : slug === "skagway" ? "/hero/skagway.jpg" : "/hero/ketchikan.png"} alt={`${portTitle} Shore Excursions`} className="h-full w-full object-cover opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20" /></div>
          <div className="relative max-w-3xl p-7 sm:p-12"><div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{portTours.length} excursion choices</div><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">What should you do in {portTitle}?</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">Start with the kind of day you want. We grouped the available FareHarbor inventory so you do not have to compare every tour one by one.</p></div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Shop {portTitle} by experience</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Start with the search you are already making</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These focused pages compare only the connected {portTitle} products that match that specific kind of port day, then lead directly to live calendars.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MONEY_LINKS[slug].map((item) => <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"><h3 className="font-black text-slate-950">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{item.text}</p><span className="mt-3 block text-xs font-black text-sky-800">Compare {item.title.toLowerCase()} →</span></Link>)}
          </div>
        </section>

        {cruiseShip && shipWindow ? <section className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5"><div className="text-xs font-black uppercase tracking-[0.14em] text-sky-800">Your port window</div><p className="mt-2 text-sm text-slate-700"><strong>{cruiseShip}</strong>: {shipWindow}. Tour-duration fit shown on this page is guidance only; confirm the exact meeting, departure, and return times on the live calendar.</p></section> : <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">Know your ship?</div><p className="mt-1 text-sm text-slate-600">Add your ship timing to narrow these choices to your actual port day.</p></div><Link href={`/plan?${qs.toString()}`} className="rounded-xl bg-slate-950 px-5 py-3 text-center text-xs font-bold text-white">Match my port day</Link></section>}

        <section className="mt-8 space-y-10">
          {groups.map((group) => <div key={group.title}><div className="mb-4"><h2 className="text-2xl font-black tracking-tight text-slate-950">{group.title}</h2><p className="mt-1 text-sm text-slate-600">{group.blurb}</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{group.tours.map((tour) => <TourCard key={`${group.title}-${tour.company}-${tour.pk}`} tour={tour} />)}</div></div>)}
        </section>

        <section className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">Still deciding?</div><h2 className="mt-2 text-2xl font-black text-slate-950">See every {portTitle} excursion</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">The groups above are shortcuts, not exclusions. Browse the full port inventory if you want to compare every available option.</p></div><div className="flex flex-wrap gap-3"><Link href="/tours" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-800">Full catalog</Link><Link href={`/plan?${qs.toString()}`} className="rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white">Help me choose</Link></div></div></section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8"><h2 className="text-xl font-black text-slate-950">Planning your {portTitle} port day</h2><p className="mt-3 text-sm leading-7 text-slate-600">{info.problem}</p><p className="mt-3 text-sm leading-7 text-slate-600">Use the operator's live calendar and your cruise line's current all-aboard instructions as the final source for timing. Build in comfortable extra time rather than relying on the shortest possible connection.</p><Link href={`/guides/how-long-does-it-take-to-get-off-the-ship-in-${slug}`} className="mt-4 inline-block text-xs font-black uppercase tracking-wider text-sky-800">Read the {portTitle} timing guide →</Link></section>
      </div>
    </main>
  );
}
