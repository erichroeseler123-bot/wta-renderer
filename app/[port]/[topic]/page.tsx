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
  eyebrow?: string;
  decisionTitle?: string;
  decisionIntro?: string;
  decisionPoints?: { title: string; text: string }[];
  faqs?: { question: string; answer: string }[];
  related?: { href: string; label: string }[];
};

const PAGES: PageConfig[] = [
  { port: "juneau", topic: "whale-watching", title: "Juneau Whale Watching Tours for Cruise Passengers", h1: "Juneau whale watching tours", description: "Compare connected Juneau whale watching excursions, then open the live calendar to check current departures, pricing and capacity.", intro: "Juneau has several whale-watching formats, from smaller boats to larger sightseeing vessels and combinations with Mendenhall Glacier. Start with the experience style you want, then confirm the departure against your actual port day.", chooserTopic: "wildlife-whales", keywords: ["whale", "lighthouse"] },
  { port: "juneau", topic: "mendenhall-glacier-tours", title: "Mendenhall Glacier Tours from Juneau Cruise Port", h1: "Mendenhall Glacier tours from Juneau", description: "Compare Mendenhall Glacier excursions connected to the Juneau catalog, including sightseeing, paddling, hiking and combination tours.", intro: "Mendenhall can be a quick sightseeing stop or the centerpiece of an active port day. These connected tours mention Mendenhall directly and range from easier viewing to paddling and hiking experiences.", chooserTopic: "glaciers", keywords: ["mendenhall"] },
  { port: "juneau", topic: "helicopter-tours", title: "Juneau Helicopter Tours: Prices & Glacier Trips (2026)", h1: "Juneau helicopter tours, prices and glacier options", description: "Compare Juneau helicopter tour prices, glacier landings, guided walks, treks and dog sledding flights. Check current operator calendars for your cruise day.", intro: "Compare the actual Juneau flightseeing choices in one place: scenic glacier landings, guided glacier walks, longer treks, ice climbing and helicopter-access dog sledding. Listed prices are starting points; open the live calendar for the rate and departure that applies to your party.", chooserTopic: "flightseeing", keywords: ["helicopter", "flightseeing", "icefield", "glacier walk", "glacier trek", "dog sled", "pilot's choice"], eyebrow: "306 search impressions across glacier and helicopter topics", decisionTitle: "Choose the right kind of Juneau helicopter tour", decisionIntro: "The largest price differences usually come from what happens after the flight—not simply how long the helicopter is in the air.", decisionPoints: [
    { title: "Scenic flight + landing", text: "Best for travelers who want the aerial views and a brief glacier stop without a strenuous guided trek." },
    { title: "Guided walk or trek", text: "Adds guided time on the ice. Compare total duration, activity level, supplied gear and mobility requirements." },
    { title: "Dog sledding by helicopter", text: "A premium combination that reaches a glacier dog camp. Weather can affect flight operations, so understand the operator's cancellation terms." },
  ], faqs: [
    { question: "How much do Juneau helicopter tours cost?", answer: "Current connected options span several price levels depending on whether the trip includes a glacier landing, guided trek, dog sledding or private flight. Use the prices shown below as starting points and open the live calendar for the exact date and passenger type." },
    { question: "Which Juneau helicopter tour is best for a cruise passenger?", answer: "Choose by port time, desired activity level and what you want to do on the glacier. Confirm the departure, meeting point and return timing against your ship's current all-aboard instructions." },
    { question: "What happens if weather cancels a helicopter tour?", answer: "Weather policies and refund terms are controlled by the operator. Review the specific tour's current cancellation language before booking." },
  ], related: [{ href: "/juneau/dog-sledding", label: "Juneau dog sledding" }, { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" }, { href: "/categories/glacier-tours", label: "All glacier tours" }] },
  { port: "juneau", topic: "dog-sledding", title: "Juneau Dog Sledding Tours and Glacier Dog Camps", h1: "Juneau dog sledding tours", description: "Compare Juneau dog sledding and glacier dog camp excursions from connected Alaska operators.", intro: "Dog sledding in Juneau ranges from summer camp experiences to helicopter-accessed glacier camps. Compare the connected options, then use the live calendar for current schedules, requirements and prices.", chooserTopic: "dog-sledding", keywords: ["dog sled", "dogsled", "sledding"] },
  { port: "juneau", topic: "fishing", title: "Juneau Fishing Charters: Salmon, Halibut & Private Trips", h1: "Juneau fishing charters for cruise passengers", description: "Compare guided Juneau fishing trips, salmon and halibut charters, combination trips and private boats with current prices and live booking calendars.", intro: "Compare guided fishing trips that can work with a Juneau cruise stop. Separate salmon, halibut, combination and private-charter choices first; then check the exact departure, trip length, fishing-license requirements and return timing for your ship day.", chooserTopic: "fishing", keywords: ["fishing", "salmon", "halibut", "charter"], exclude: ["salmon bake"], eyebrow: "The site's largest search-demand cluster", decisionTitle: "Salmon, halibut or a private Juneau charter?", decisionIntro: "These are different trips with different price structures. Start with the species and boat format instead of comparing every listing as though it were the same product.", decisionPoints: [
    { title: "Salmon fishing", text: "A focused choice for travelers primarily interested in salmon. Check season, trip length and whether licenses or processing are included." },
    { title: "Halibut or combination trips", text: "Often longer or more timing-sensitive. Confirm the operator considers your ship window workable before booking." },
    { title: "Private fishing charter", text: "Priced for the boat or private group rather than just one seat. Compare total group cost, passenger limit and target species." },
  ], faqs: [
    { question: "Can I take a Juneau fishing charter during a cruise stop?", answer: "Many fishing departures are designed for visitors, but fit depends on your ship's port window and the charter's actual departure and return time. Confirm both before booking." },
    { question: "Should I choose salmon or halibut fishing in Juneau?", answer: "Choose based on season, trip duration and the kind of fishing experience you want. Halibut and combination trips may require more time; the operator can confirm what is realistic on your date." },
    { question: "Is a private Juneau fishing charter priced per person?", answer: "Private charter listings may show a whole-boat price, while shared trips commonly show a passenger rate. Read the rate description and passenger capacity before comparing totals." },
    { question: "Are fishing licenses and fish processing included?", answer: "Inclusions vary by operator. Check the individual charter details for licenses, gear, catch processing, shipping arrangements, taxes and gratuities." },
  ], related: [{ href: "/ports/juneau", label: "All Juneau excursions" }, { href: "/juneau/whale-watching", label: "Juneau whale watching" }, { href: "/guides/how-long-does-it-take-to-get-off-the-ship-in-juneau", label: "Juneau cruise-port timing" }] },
  { port: "juneau", topic: "gold-panning", title: "Alaska Gold Panning Tours in Juneau for Cruise Passengers", h1: "Alaska gold panning tours from Juneau", description: "Compare Juneau gold panning and historic gold mining excursions, including gold-panning and salmon-bake combinations for Alaska cruise days.", intro: "Juneau's gold-rush history is available in hands-on excursions ranging from focused panning experiences to combination trips with a salmon bake. Compare the current choices and check the live departure against your cruise-port time.", chooserTopic: "best-overall", keywords: ["gold panning", "gold mining", "panning adventure"], exclude: [], eyebrow: "A growing Alaska search opportunity", decisionTitle: "What to compare on a gold panning tour", decisionIntro: "The key difference is whether you want a focused hands-on activity or a broader history-and-meal combination.", decisionPoints: [
    { title: "Hands-on panning", text: "Prioritizes learning the technique and trying it yourself. Check transportation, accessibility and total activity time." },
    { title: "Mining history", text: "Adds interpretation about Juneau's gold-rush era and historic mining locations." },
    { title: "Panning + salmon bake", text: "Combines two popular Alaska experiences in one departure. Compare the total duration with your port window." },
  ], faqs: [
    { question: "Can cruise passengers take a gold panning tour in Juneau?", answer: "Yes, when the departure and return fit the ship's port window. Confirm the current meeting point and all-aboard time before booking." },
    { question: "Do Alaska gold panning tours let you keep the gold?", answer: "Policies and the type of material used can vary. Check the individual operator description for exactly what participants may keep." },
  ], related: [{ href: "/ports/juneau", label: "All Juneau excursions" }, { href: "/skagway/gold-rush-tours", label: "Skagway Gold Rush tours" }, { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" }] },
  { port: "ketchikan", topic: "bear-tours", title: "Ketchikan Bear Tours and Wildlife Excursions", h1: "Ketchikan bear tours", description: "Compare Ketchikan bear viewing and wildlife excursions, including rainforest and flightseeing options when present in connected inventory.", intro: "Bear-focused excursions can differ by location, transportation and season. These are the connected Ketchikan products that specifically mention bears or bear-viewing areas; use the operator calendar and details to confirm current conditions and requirements.", chooserTopic: "wildlife-whales", keywords: ["bear", "traitor's cove", "anan creek"] },
  { port: "ketchikan", topic: "misty-fjords", title: "Misty Fjords Tours from Ketchikan: Compare Your Options", h1: "Misty Fjords tours from Ketchikan", description: "Compare Misty Fjords flightseeing, boat and expedition-style tours from Ketchikan, with current prices and live calendars for cruise passengers.", intro: "Misty Fjords National Monument can be experienced by air, water or a more private expedition-style trip. Compare the connected choices by transportation, total duration and price, then open the live calendar for a departure that fits your Ketchikan port day.", chooserTopic: "flightseeing", keywords: ["misty fjords", "misty"], eyebrow: "Ketchikan's strongest search-demand cluster", decisionTitle: "How do you want to see Misty Fjords?", decisionIntro: "The experience changes substantially depending on whether the trip is primarily in the air or on the water.", decisionPoints: [
    { title: "Flightseeing", text: "Covers the landscape efficiently and emphasizes aerial views. Check aircraft type, flight time and whether any landing is included." },
    { title: "Boat or expedition", text: "Puts more of the trip at water level and may require a larger share of your port day. Compare total travel time carefully." },
    { title: "Private option", text: "Can offer a more flexible group experience, usually at a higher total price. Compare capacity and whole-party cost." },
  ], faqs: [
    { question: "How do you tour Misty Fjords from Ketchikan?", answer: "Common formats include flightseeing and water-based expedition trips. The best fit depends on port time, weather tolerance, budget and whether you prefer aerial views or time on the water." },
    { question: "How long is a Misty Fjords tour from Ketchikan?", answer: "Duration varies by transportation and operator. Check the total listed experience—not only flight or boat time—and allow for meeting and transfer instructions." },
    { question: "Will a Misty Fjords tour work with my cruise schedule?", answer: "It can when the exact departure and return fit your port window. Confirm your berth, meeting point and cruise line's current all-aboard time." },
  ], related: [{ href: "/ports/ketchikan", label: "Ketchikan cruise-port guide" }, { href: "/ketchikan/adventure-tours", label: "Ketchikan adventure tours" }, { href: "/categories/flightseeing", label: "All Alaska flightseeing" }] },
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
  const canonical = `https://welcometoalaskatours.com/${config.port}/${config.topic}`;
  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Alaska Tours", item: "https://welcometoalaskatours.com" },
      { "@type": "ListItem", position: 2, name: `${portTitle} excursions`, item: `https://welcometoalaskatours.com/ports/${config.port}` },
      { "@type": "ListItem", position: 3, name: config.h1, item: canonical },
    ] },
    ...(config.faqs?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: config.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] : []),
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href={`/ports/${config.port}`} className="text-sm font-bold text-cyan-200 hover:text-white">← {portTitle} excursions</Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">{config.eyebrow || `${portTitle} shore excursions`}</div>
          <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">{config.h1}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">{config.intro}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={chooserHref} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200">Show my 4 best choices →</Link>
            <Link href={`/ports/${config.port}`} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20">Browse all {portTitle} tours</Link>
          </div>
        </div>
      </section>

      {config.decisionPoints?.length ? (
        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Compare before you book</div><h2 className="mt-2 text-3xl font-black tracking-tight">{config.decisionTitle}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{config.decisionIntro}</p></div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">{config.decisionPoints.map((point) => <div key={point.title} className="rounded-2xl bg-slate-50 p-5"><h3 className="font-black text-slate-950">{point.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{point.text}</p></div>)}</div>
          </div>
        </section>
      ) : null}

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

      {config.faqs?.length ? <section className="mx-auto max-w-5xl px-6 pb-14"><div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8"><div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Practical answers</div><h2 className="mt-2 text-3xl font-black tracking-tight">Questions cruise passengers ask</h2><div className="mt-6 divide-y divide-slate-200">{config.faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-black text-slate-950 marker:hidden">{faq.question}<span className="float-right text-sky-700 group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{faq.answer}</p></details>)}</div>{config.related?.length ? <div className="mt-6 border-t border-slate-200 pt-6"><h3 className="text-sm font-black">Keep planning</h3><div className="mt-3 flex flex-wrap gap-2">{config.related.map((item) => <Link key={item.href} href={item.href} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-sky-800 hover:bg-white">{item.label} →</Link>)}</div></div> : null}</div></section> : null}
    </main>
  );
}
