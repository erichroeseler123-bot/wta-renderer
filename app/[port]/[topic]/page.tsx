import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterToursSnapshot, type HelicopterTour } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";

type PageConfig = {
  port: "juneau" | "ketchikan" | "skagway";
  topic: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  chooserTopic: string;
  keywords: string[];
  exclude?: string[];
};

const PAGES: PageConfig[] = [
  { port: "juneau", topic: "whale-watching", title: "Juneau Whale Watching Tours for Cruise Passengers", h1: "Juneau whale watching tours", description: "Compare connected Juneau whale watching excursions, then open the live calendar to check current departures, pricing and capacity.", intro: "Juneau has several whale-watching formats, from smaller boats to larger sightseeing vessels and combinations with Mendenhall Glacier. Start with the experience style you want, then confirm the departure against your actual port day.", chooserTopic: "wildlife-whales", keywords: ["whale", "lighthouse"] },
  { port: "juneau", topic: "mendenhall-glacier-tours", title: "Mendenhall Glacier Tours from Juneau Cruise Port", h1: "Mendenhall Glacier tours from Juneau", description: "Compare Mendenhall Glacier excursions connected to the Juneau catalog, including sightseeing, paddling, hiking and combination tours.", intro: "Mendenhall can be a quick sightseeing stop or the centerpiece of an active port day. These connected tours mention Mendenhall directly and range from easier viewing to paddling and hiking experiences.", chooserTopic: "glaciers", keywords: ["mendenhall"] },
  { port: "juneau", topic: "helicopter-tours", title: "Juneau Helicopter Tours and Glacier Flightseeing", h1: "Juneau helicopter tours", description: "Compare Juneau helicopter and glacier flightseeing excursions, then check live operator calendars for current departures and pricing.", intro: "Juneau has one of the deepest flightseeing catalogs in Alaska. Compare glacier landings, dog-sled combinations, trekking options and scenic flights without having to open every operator listing first.", chooserTopic: "flightseeing", keywords: ["helicopter", "flightseeing", "icefield"] },
  { port: "juneau", topic: "dog-sledding", title: "Juneau Dog Sledding Tours and Glacier Dog Camps", h1: "Juneau dog sledding tours", description: "Compare Juneau dog sledding and glacier dog camp excursions from connected Alaska operators.", intro: "Dog sledding in Juneau ranges from summer camp experiences to helicopter-accessed glacier camps. Compare the connected options, then use the live calendar for current schedules, requirements and prices.", chooserTopic: "dog-sledding", keywords: ["dog sled", "dogsled", "sledding"] },
  { port: "juneau", topic: "fishing", title: "Juneau Fishing Charters for Cruise Passengers", h1: "Juneau fishing charters", description: "Compare Juneau salmon, halibut and private fishing charters connected to the Alaska excursion catalog.", intro: "Juneau fishing choices include salmon, halibut, combination trips and private charters. Prices and trip formats vary widely, so compare the connected products first and verify the live departure before booking.", chooserTopic: "fishing", keywords: ["fishing", "salmon", "halibut", "charter"], exclude: ["salmon bake"] },
  { port: "ketchikan", topic: "bear-tours", title: "Ketchikan Bear Tours and Wildlife Excursions", h1: "Ketchikan bear tours", description: "Compare Ketchikan bear viewing and wildlife excursions, including rainforest and flightseeing options when present in connected inventory.", intro: "Bear-focused excursions can differ by location, transportation and season. These are the connected Ketchikan products that specifically mention bears or bear-viewing areas; use the operator calendar and details to confirm current conditions and requirements.", chooserTopic: "wildlife-whales", keywords: ["bear", "traitor's cove", "anan creek"] },
  { port: "ketchikan", topic: "misty-fjords", title: "Misty Fjords Tours from Ketchikan", h1: "Misty Fjords tours from Ketchikan", description: "Compare connected Misty Fjords excursions from Ketchikan, including flightseeing and expedition-style options.", intro: "Misty Fjords is one of Ketchikan's signature sightseeing choices. The connected catalog includes different ways to experience it, so compare trip format and price before opening the live calendar.", chooserTopic: "flightseeing", keywords: ["misty fjords", "misty"] },
  { port: "ketchikan", topic: "kayaking", title: "Ketchikan Kayaking and Canoe Shore Excursions", h1: "Ketchikan kayaking and canoe tours", description: "Compare Ketchikan kayaking, canoe and paddling excursions connected to the shore-excursion catalog.", intro: "Ketchikan's protected waterways and rainforest setting create several paddling options. Compare sea kayaking, canoe and combination experiences, then check operator requirements before booking.", chooserTopic: "adventure", keywords: ["kayak", "canoe", "paddle"] },
  { port: "ketchikan", topic: "adventure-tours", title: "Ketchikan Adventure Tours for Cruise Passengers", h1: "Ketchikan adventure tours", description: "Compare Ketchikan adventure excursions including kayaking, canoes, UTVs, Jeeps, ziplines and snorkeling when available.", intro: "If you want a more active Ketchikan day, this page pulls together the connected excursions with obvious adventure cues. Check age, weight, mobility and gear requirements on the operator page before booking.", chooserTopic: "adventure", keywords: ["kayak", "canoe", "utv", "jeep", "zipline", "snorkel", "zodiac", "kart", "safari"] },
  { port: "skagway", topic: "helicopter-tours", title: "Skagway Helicopter Tours and Glacier Flightseeing", h1: "Skagway helicopter tours", description: "Compare connected Skagway helicopter excursions and glacier flightseeing, then check live calendars for current departures.", intro: "Skagway's connected flight inventory includes glacier-focused helicopter experiences. Compare the available formats here, then confirm the exact departure, price and operator instructions on the live calendar.", chooserTopic: "flightseeing", keywords: ["helicopter", "glacier discovery", "flightseeing"] },
  { port: "skagway", topic: "gold-rush-tours", title: "Skagway Gold Rush Tours and Liarsville Excursions", h1: "Skagway Gold Rush tours", description: "Compare connected Skagway Gold Rush and Liarsville excursions for cruise passengers.", intro: "Skagway's Gold Rush history is one of the port's defining themes. These connected excursions mention Liarsville, Gold Rush experiences or related historical stops, with live schedules available on the product calendar.", chooserTopic: "best-overall", keywords: ["gold rush", "liarsville", "gold"] },
  { port: "skagway", topic: "dog-sledding", title: "Skagway Dog Sledding and Glacier Dog Tours", h1: "Skagway dog sledding tours", description: "Compare connected Skagway dog sledding and glacier dog experiences, with live departure checks before booking.", intro: "Skagway dog-sled experiences can involve helicopter access and weather-sensitive glacier operations. Use this page to compare the connected choices, then verify the current departure directly on the live calendar.", chooserTopic: "dog-sledding", keywords: ["dog", "sled", "dogsled"] },
  { port: "skagway", topic: "adventure-tours", title: "Skagway Adventure Tours for Cruise Passengers", h1: "Skagway adventure tours", description: "Compare connected Skagway adventure excursions, including glacier flights, scooter experiences and active port-day options.", intro: "Skagway's active options are a smaller catalog than Juneau or Ketchikan, which makes a focused comparison useful. These are connected products with adventure, scooter, glacier or outdoor-experience cues.", chooserTopic: "adventure", keywords: ["scooter", "helicopter", "glacier", "adventure"] },
];

function textFor(tour: HelicopterTour) { return `${tour.title} ${tour.category || ""} ${tour.description || ""}`.toLowerCase(); }
function priceNumber(value?: string) { const match = String(value || "").match(/\$\s*([0-9][0-9,]*)/); return match ? Number(match[1].replace(/,/g, "")) : null; }
function adultPrice(value?: string) { const match = String(value || "").match(/\bAdult\s*[:|-]?\s*\$\s*([0-9][0-9,]*)/i); return match ? Number(match[1].replace(/,/g, "")) : null; }
function durationLabel(value?: string) { const match = String(value || "").match(/(\d+(?:\.\d+)?)\s*hours?/i); return match ? `${match[1]} hours` : "Check tour details"; }
function configFor(port: string, topic: string) { return PAGES.find((page) => page.port === port && page.topic === topic); }

export function generateStaticParams() { return PAGES.map(({ port, topic }) => ({ port, topic })); }

export async function generateMetadata({ params }: { params: Promise<{ port: string; topic: string }> }): Promise<Metadata> {
  const { port, topic } = await params;
  const config = configFor(port, topic);
  if (!config) return {};
  const canonical = `https://welcometoalaskatours.com/${config.port}/${config.topic}`;
  return { title: config.title, description: config.description, alternates: { canonical }, openGraph: { title: config.title, description: config.description, url: canonical, type: "website" } };
}

export default async function MoneyPage({ params }: { params: Promise<{ port: string; topic: string }> }) {
  const { port, topic } = await params;
  const config = configFor(port, topic);
  if (!config) notFound();

  const allTours = sanitizeTours(await getHelicopterToursSnapshot());
  const portTours = allTours.filter((tour) => tour.port === config.port);
  const matches = portTours.filter((tour) => {
    const text = textFor(tour);
    return config.keywords.some((keyword) => text.includes(keyword)) && !(config.exclude || []).some((keyword) => text.includes(keyword));
  });

  const displayed = matches.sort((a, b) => (priceNumber(a.fromPrice) ?? Number.MAX_SAFE_INTEGER) - (priceNumber(b.fromPrice) ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title)).slice(0, 12);
  const portTitle = config.port.charAt(0).toUpperCase() + config.port.slice(1);
  const chooserHref = `/plan?port=${config.port}&topic=${encodeURIComponent(config.chooserTopic)}&sourcePage=/${config.port}/${config.topic}`;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href={`/ports/${config.port}`} className="text-sm font-bold text-cyan-200 hover:text-white">← {portTitle} excursions</Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">{portTitle} shore excursions</div>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{config.h1}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">{config.intro}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={chooserHref} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200">Show my 4 best choices →</Link>
            <Link href={`/ports/${config.port}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20">Browse all {portTitle} tours</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Connected inventory</div><h2 className="mt-2 text-3xl font-black tracking-tight">Compare the current catalog</h2></div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">When an adult rate is explicitly listed, we show it first. A lower child, lap-child, or other rate may still make the operator's minimum "from" price lower. Open the live calendar for the exact rate that applies to your party.</p>
        </div>

        {displayed.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {displayed.map((tour) => {
              const adult = adultPrice(tour.description);
              const lowest = priceNumber(tour.fromPrice);
              return (
                <article key={`${tour.company}-${tour.pk}`} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                  {tour.image ? <div className="aspect-[16/9] overflow-hidden bg-slate-100"><img src={tour.image} alt={tour.title} className="h-full w-full object-cover" /></div> : null}
                  <div className="p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">{tour.category || `${portTitle} excursion`}</div>
                    <h3 className="mt-2 text-xl font-black tracking-tight">{tour.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                      <span className="rounded-full bg-slate-100 px-3 py-2">{adult ? `Adult $${adult.toLocaleString()}` : (tour.fromPrice || "Check price")}</span>
                      {adult && lowest && lowest < adult ? <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-800">Lowest listed rate ${lowest.toLocaleString()}</span> : null}
                      <span className="rounded-full bg-slate-100 px-3 py-2">{durationLabel(tour.description)}</span>
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{tour.description || "Open the tour details for operator information and booking requirements."}</p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      <Link href={`/tours/${tour.company}/${tour.pk}?sourcePage=/${config.port}/${config.topic}`} className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-black hover:bg-slate-50">Details</Link>
                      <Link href={`/tours/${tour.company}/${tour.pk}/calendar?sourcePage=/${config.port}/${config.topic}`} className="rounded-xl bg-sky-700 px-4 py-3 text-center text-sm font-black text-white hover:bg-sky-800">Live calendar →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No matching connected products are listed in the current snapshot. Use the {portTitle} catalog to browse available excursions.</div>}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-14">
        <div className="rounded-[2rem] border border-sky-100 bg-sky-50 p-7 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div><div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Too many choices?</div><h2 className="mt-2 text-2xl font-black">Turn this into a four-tour shortlist.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose your port-day style first. Then open the live calendar on the tours that look best and compare the actual departure with your cruise line's all-aboard time.</p></div>
          <Link href={chooserHref} className="mt-5 inline-flex shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white sm:mt-0">Find my best choices</Link>
        </div>
      </section>
    </main>
  );
}
