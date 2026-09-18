import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/alaska-nature-by-cruise-port";

export const metadata: Metadata = {
  title: "Alaska Nature by Cruise Port: Birds, Northern Lights & Whales (2026)",
  description:
    "A realistic nature guide for Alaska cruise passengers: bird watching, northern lights visibility, and whale viewing across Juneau, Ketchikan, Skagway, Sitka, and Icy Strait Point.",
  alternates: { canonical },
  openGraph: {
    title: "Alaska Nature by Cruise Port: Birds, Northern Lights & Whales (2026)",
    description:
      "A realistic nature guide for Alaska cruise passengers: bird watching, northern lights visibility, and whale viewing across Juneau, Ketchikan, Skagway, Sitka, and Icy Strait Point.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    question: "Can you see the northern lights on a May, June, or July Alaska cruise?",
    answer:
      "No. During peak summer (May through July), Southeast Alaska experiences 17 to 22 hours of daily sunlight and twilight. The sky never becomes dark enough for aurora viewing, even during major solar storms. True night darkness only returns in late August and September.",
  },
  {
    question: "What are the requirements to see the northern lights on an Alaska cruise?",
    answer:
      "Northern lights visibility requires four specific factors aligning: (1) seasonal darkness (late August through September), (2) clear skies with low cloud cover, (3) elevated solar activity (Kp index of 3 or higher), and (4) minimal artificial light pollution (best observed from the open top decks of your ship at sea late at night between 11:00 PM and 3:30 AM).",
  },
  {
    question: "Which port offers the highest chance of seeing humpback whales?",
    answer:
      "Juneau and Icy Strait Point (Hoonah) provide the most reliable seasonal opportunities in Southeast Alaska. The nutrient-rich waters of Auke Bay, Favorite Channel, and Point Adolphus serve as primary summer feeding grounds where hundreds of humpback whales congregate from May through September.",
  },
  {
    question: "Do I need to book a boat excursion to see whales, or can I see them from the cruise ship?",
    answer:
      "While passengers occasionally spot distant whale blows or tail flukes from cruise ship open decks—especially while navigating Lynn Canal, Icy Strait, or Snow Passage—a dedicated small-boat catamaran excursion gets you significantly closer to active feeding grounds with an experienced naturalist guide.",
  },
  {
    question: "Where is the best port to see bald eagles in Alaska?",
    answer:
      "Ketchikan and Juneau have extraordinary bald eagle concentrations. In Ketchikan, dozens of eagles regularly nest, fish, and roost along Creek Street, harbor pilings, and the Tongass rainforest shoreline within easy walking distance of the cruise berths.",
  },
  {
    question: "Are wildlife sightings or aurora visibility guaranteed?",
    answer:
      "Reputable Juneau boat operators offer 100% sighting guarantees for humpback whales during the May–September season due to consistent feeding aggregations. However, wild animal behavior in open marine waters is never completely predictable, and northern lights visibility is heavily weather-dependent and can never be guaranteed.",
  },
];

export default function AlaskaNatureGuidePage() {
  const geoFact = getAlaskaGeoFact("all", "alaska-nature-by-cruise-port");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Alaska Nature by Cruise Port: Birds, Northern Lights & Whales",
    description: metadata.description,
    datePublished: "2026-03-15",
    dateModified: "2026-09-17",
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Welcome To Alaska Tours" },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_35%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-[linear-gradient(135deg,#064e3b_0%,#0f172a_55%,#0c4a6e_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/guides" className="text-sm font-bold text-emerald-300 hover:text-white">
            {"← Alaska Guides Directory"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
            Alaska Cruise Wildlife & Nature Intelligence · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Alaska Nature by Cruise Port: Birds, Northern Lights & Whales
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Understand when, where, and how you can realistically experience Southeast Alaska&rsquo;s three most sought-after
            natural wonders: coastal bird life, the northern lights, and humpback whales. Grounded in seasonal realities,
            daylight cycles, and practical cruise-port logistics.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/ports"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-emerald-300 shadow-md transition"
            >
              Explore Alaska Ports →
            </Link>
            <Link
              href="/juneau/whale-watching"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Juneau Whale Watching Tours
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Direct GEO Answer Card */}
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        {/* Master Comparison Matrix Table */}
        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-800">Quick Comparison Matrix</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Nature & Wildlife Opportunities by Port
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Use this side-by-side overview to plan your shore days and manage expectations across your sailing itinerary.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-900 font-black">
                  <th className="p-3">Port</th>
                  <th className="p-3">🦅 Bird Watching</th>
                  <th className="p-3">🌌 Northern Lights</th>
                  <th className="p-3">🐋 Whale Viewing</th>
                  <th className="p-3">Top Access Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-950">
                    <Link href="/ports/juneau" className="hover:text-emerald-700 underline underline-offset-2">Juneau</Link>
                  </td>
                  <td className="p-3">Mendenhall Wetlands, Auke Bay alcids, Mt. Roberts alpine species.</td>
                  <td className="p-3"><span className="font-semibold text-amber-800">Late Aug–Sept only</span>; cloud cover frequent.</td>
                  <td className="p-3"><span className="font-semibold text-emerald-800">High opportunity</span> in Auke Bay & Favorite Channel.</td>
                  <td className="p-3"><Link href="/juneau/whale-watching" className="font-semibold text-sky-700 hover:underline">Whale boat excursion</Link></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">
                    <Link href="/ports/ketchikan" className="hover:text-emerald-700 underline underline-offset-2">Ketchikan</Link>
                  </td>
                  <td className="p-3">Dense nesting bald eagles, Ward Lake rainforest, Clover Pass coves.</td>
                  <td className="p-3"><span className="font-semibold text-amber-800">Late Aug–Sept only</span>; high rain/cloud barrier.</td>
                  <td className="p-3"><span className="font-semibold text-sky-800">Moderate opportunity</span> in Tongass Narrows & Clarence Strait.</td>
                  <td className="p-3"><Link href="/ketchikan/kayaking" className="font-semibold text-sky-700 hover:underline">Sea kayaking & Zodiacs</Link></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">
                    <Link href="/ports/skagway" className="hover:text-emerald-700 underline underline-offset-2">Skagway</Link>
                  </td>
                  <td className="p-3">Yakutania Point walk from pier, Dyea tidal flats, American Dippers.</td>
                  <td className="p-3"><span className="font-semibold text-amber-800">Late Aug–Sept only</span>; drier rain-shadow skies.</td>
                  <td className="p-3"><span className="font-semibold text-slate-800">Transit sightings</span> in Lynn Canal during ship sail-in/out.</td>
                  <td className="p-3"><Link href="/skagway/adventure-tours" className="font-semibold text-sky-700 hover:underline">Yakutania walk / Scooters</Link></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">Sitka</td>
                  <td className="p-3">Totem Park trails, Alaska Raptor Center, St. Lazaria seabird colony.</td>
                  <td className="p-3"><span className="font-semibold text-amber-800">Late Aug–Sept only</span>; oceanic cloud cover.</td>
                  <td className="p-3"><span className="font-semibold text-sky-800">Moderate opportunity</span> in Sitka Sound (humpbacks & sea otters).</td>
                  <td className="p-3">Wildlife boat / Totem Park walk</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">Icy Strait Point</td>
                  <td className="p-3">Port Frederick shoreline, Game Creek wetlands, old-growth forest.</td>
                  <td className="p-3"><span className="font-semibold text-amber-800">Late Aug–Sept only</span>; low light pollution.</td>
                  <td className="p-3"><span className="font-semibold text-emerald-800">High opportunity</span> at Point Adolphus feeding grounds.</td>
                  <td className="p-3">Point Adolphus whale boat</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pillar 1: Bird Watching by Port */}
        <section id="birds" className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-800">Pillar 1: Avian Wildlife</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Bird Watching by Alaska Cruise Port
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Southeast Alaska is a crucial segment of the Pacific Flyway, where temperate rainforests meet rich marine waterways.
              Here is how bird watching works in each port:
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-emerald-950 text-base">Juneau Bird Watching</div>
              <p><strong>Habitat:</strong> Intertidal mudflats, marine channels, subalpine slopes.</p>
              <p><strong>Top Locations:</strong> Mendenhall Wetlands State Game Refuge (Dike Trail), Auke Bay marine waters, Gold Creek Flume.</p>
              <p><strong>Key Species:</strong> Bald Eagles, Marbled Murrelets, Pigeon Guillemots, Barrow&rsquo;s Goldeneyes, Arctic Terns, Rufous Hummingbirds.</p>
              <p><strong>How to Access:</strong> 15-minute taxi/bus to Mendenhall wetlands or during an <Link href="/juneau/whale-watching" className="font-bold text-emerald-800 underline">Auke Bay whale tour</Link>.</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-emerald-950 text-base">Ketchikan Bird Watching</div>
              <p><strong>Habitat:</strong> Coastal rainforest, saltwater coves, salmon streams.</p>
              <p><strong>Top Locations:</strong> Creek Street pilings, Ward Lake Trail (1.3-mile flat loop), Clover Pass, Herring Cove.</p>
              <p><strong>Key Species:</strong> Dense nesting Bald Eagles, Great Blue Herons, Belted Kingfishers, Harlequin Ducks, Pacific Wrens, Varied Thrushes.</p>
              <p><strong>How to Access:</strong> Walk from downtown berths or book <Link href="/ketchikan/kayaking" className="font-bold text-emerald-800 underline">Clover Pass sea kayaking</Link>.</p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-emerald-950 text-base">Skagway Bird Watching</div>
              <p><strong>Habitat:</strong> Coastal rocky points, glacial river estuaries, mountain creeks.</p>
              <p><strong>Top Locations:</strong> Yakutania Point (15-min walk from pier), Taiya River estuary in Dyea, Lower Dewey Lake.</p>
              <p><strong>Key Species:</strong> Bonaparte&rsquo;s Gulls, Arctic Terns, American Dippers, Townsend&rsquo;s Warblers, Boreal Chickadees, Harlequin Ducks.</p>
              <p><strong>How to Access:</strong> Self-guided walk from cruise dock or <Link href="/skagway/adventure-tours" className="font-bold text-emerald-800 underline">scooters to Dyea flats</Link>.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            <strong>Wildlife Viewing Ethics:</strong> Maintain at least 100 yards from active bald eagle nests. Do not use audio playback calls near nesting birds. For comprehensive walking trails and species guides, read our dedicated <Link href="/guides/best-alaska-cruise-ports-for-bird-watching" className="font-bold text-emerald-800 underline">Best Alaska Cruise Ports for Bird Watching Guide</Link>.
          </div>
        </section>

        {/* Pillar 2: Northern Lights by Port */}
        <section id="aurora" className="mt-10 rounded-[2rem] border border-indigo-200 bg-[linear-gradient(180deg,#f5f3ff_0%,#ffffff_40%)] p-6 shadow-sm sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-indigo-900">Pillar 2: Aurora Borealis</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Northern Lights by Alaska Cruise Port: Realities & Requirements
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seeing the aurora borealis from a cruise ship is a bucket-list aspiration, but cruise passengers need clear,
              unvarnished facts about solar activity and Alaska&rsquo;s extreme daylight cycles.
            </p>
          </div>

          {/* The Daylight Barrier */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2 text-slate-800 text-xs sm:text-sm">
            <div className="font-bold text-amber-950 text-base">⚠️ The Summer Daylight Reality (May, June & July)</div>
            <p>
              In May, June, and July, Southeast Alaska experiences 17 to 22 hours of sunlight and twilight. Even when the sun dips
              below the horizon around 10:30 PM, the sky remains in nautical twilight and never achieves true night darkness.
              Even during extreme solar flares and geomagnetic storms, <strong>the northern lights cannot be seen against a twilight sky</strong>.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-indigo-950 text-base">Juneau Aurora Conditions</div>
              <p><strong>Seasonal Window:</strong> Late August through September only.</p>
              <p><strong>Sky Conditions:</strong> Juneau has high average cloud cover; requires a clear weather front and Kp index of 3+.</p>
              <p><strong>Where to Watch:</strong> From open ship decks late at night (11:30 PM–3:00 AM) after sailing away from downtown city lights.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-indigo-950 text-base">Ketchikan Aurora Conditions</div>
              <p><strong>Seasonal Window:</strong> Late August through September only.</p>
              <p><strong>Sky Conditions:</strong> Ketchikan&rsquo;s southern latitude and high rainfall create frequent cloud cover; requires Kp 4+ and clear skies.</p>
              <p><strong>Where to Watch:</strong> On deck at night while transiting Clarence Strait.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="font-bold text-indigo-950 text-base">Skagway Aurora Conditions</div>
              <p><strong>Seasonal Window:</strong> Late August through September.</p>
              <p><strong>Sky Conditions:</strong> Skagway is drier with fewer overcast days than Juneau or Ketchikan, providing higher potential on clear September nights.</p>
              <p><strong>Where to Watch:</strong> Top ship deck navigating Lynn Canal at night or Yakutania Point on evening port calls.</p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs leading-5 text-indigo-950 space-y-1">
            <strong>Cruise Passenger Tip:</strong> If your cruise departs in late August or September, ask the ship&rsquo;s guest services desk if they offer an automated &ldquo;aurora wake-up call&rdquo; to your stateroom phone if the bridge spots northern lights activity overnight.
          </div>
        </section>

        {/* Pillar 3: Whale Viewing by Port */}
        <section id="whales" className="mt-10 rounded-[2rem] border border-sky-200 bg-[linear-gradient(180deg,#f0f9ff_0%,#ffffff_40%)] p-6 shadow-sm sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-sky-900">Pillar 3: Marine Mammals</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Chances of Seeing Whales by Port: Habitats & Tours
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Over 500 humpback whales migrate thousands of miles from warm winter breeding waters in Hawaii and Mexico
              to feast in the cold, nutrient-rich channels of Southeast Alaska from May through September.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-sky-100 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-base">Juneau</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Top Port</span>
              </div>
              <p><strong>Opportunity:</strong> High Seasonal Opportunity via boat excursion.</p>
              <p><strong>Habitat:</strong> Auke Bay, Favorite Channel, Saginaw Channel.</p>
              <p><strong>Behaviors:</strong> Bubble-net feeding groups, fluking dives, lunges, and breaches.</p>
              <p><strong>Excursion:</strong> 3.5h standalone catamaran tour or 5h Mendenhall combo. <Link href="/juneau/whale-watching" className="font-bold text-sky-700 underline">View Juneau whale tours →</Link></p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-base">Icy Strait Point</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Top Port</span>
              </div>
              <p><strong>Opportunity:</strong> High Seasonal Opportunity via boat tour.</p>
              <p><strong>Habitat:</strong> Point Adolphus & Icy Strait marine corridor.</p>
              <p><strong>Behaviors:</strong> Heavy krill feeding aggregations, orca pods, sea otters.</p>
              <p><strong>Excursion:</strong> Dedicated whale boat excursions departing from Wilderness Landing.</p>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-white p-5 space-y-2 text-xs sm:text-sm text-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-950 text-base">Ketchikan & Skagway</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">Moderate / Transit</span>
              </div>
              <p><strong>Opportunity:</strong> Moderate on marine excursions; occasional ship deck sightings.</p>
              <p><strong>Habitat:</strong> Tongass Narrows, Clarence Strait, Lynn Canal.</p>
              <p><strong>Behaviors:</strong> Migratory pod transits, shoreline eagle & seal interactions.</p>
              <p><strong>Excursion:</strong> <Link href="/ketchikan/kayaking" className="font-bold text-sky-700 underline">Clover Pass sea kayaking</Link> or Lynn Canal viewing.</p>
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-xs leading-5 text-sky-950">
            <strong>Excursion vs. Ship Balcony:</strong> While occasional whale blows can be seen from cruise ship balconies while underway, dedicated small-boat catamarans use sonar, local captain communication networks, and hydrophones to bring you directly to active feeding zones safely and legally under NOAA viewing regulations.
          </div>
        </section>

        {/* 5-Month Cruise Season Matrix */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-800">Seasonal Calendar</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Month-by-Month Alaska Nature & Daylight Calendar
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Match your cruise travel month to seasonal daylight hours and wildlife activity:
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-900 font-black">
                  <th className="p-3">Month</th>
                  <th className="p-3">Daylight Hours</th>
                  <th className="p-3">🦅 Bird Life</th>
                  <th className="p-3">🐋 Whales</th>
                  <th className="p-3">🌌 Northern Lights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-3 font-bold text-slate-950">May</td>
                  <td className="p-3">16–17 hours</td>
                  <td className="p-3">Peak spring migration along Pacific Flyway; arriving shorebirds.</td>
                  <td className="p-3">Arriving humpbacks begin active feeding in northern channels.</td>
                  <td className="p-3 text-slate-400">Not visible (twilight throughout the night).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">June</td>
                  <td className="p-3">18–19 hours (Solstice)</td>
                  <td className="p-3">Active breeding & seabird colony nesting; forest songbirds active.</td>
                  <td className="p-3">High whale presence across Juneau & Icy Strait.</td>
                  <td className="p-3 text-slate-400">Not visible (midnight twilight).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">July</td>
                  <td className="p-3">17–18 hours</td>
                  <td className="p-3">Seabird chicks fledging; alpine songbirds active on high trails.</td>
                  <td className="p-3">Peak summer feeding; bubble-net feeding groups observed.</td>
                  <td className="p-3 text-slate-400">Not visible (insufficient darkness).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">August</td>
                  <td className="p-3">14–15 hours</td>
                  <td className="p-3">Massive eagle aggregations along salmon spawning streams.</td>
                  <td className="p-3">Active humpback feeding and orca pod activity.</td>
                  <td className="p-3"><span className="font-semibold text-emerald-800">Possible late August</span> on dark clear nights (Kp 3+).</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-950">September</td>
                  <td className="p-3">12–13 hours</td>
                  <td className="p-3">Fall waterfowl migration; eagles feast on remaining salmon.</td>
                  <td className="p-3">Whales feeding heavily before southward migration.</td>
                  <td className="p-3"><span className="font-semibold text-emerald-800">Best seasonal opportunity</span> on clear dark nights.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-emerald-800">Frequently Asked Questions</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Common Questions About Alaska Cruise Nature & Wildlife
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-5 open:bg-white open:shadow-sm transition"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900 text-sm sm:text-base">
                  <span>{faq.question}</span>
                  <span className="ml-4 text-emerald-600 transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-6 text-slate-700 border-t border-slate-100 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Excursions & Ports */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-emerald-800">Port Day Planning</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Explore Related Excursions by Port
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            <Link
              href="/juneau/whale-watching"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Juneau Whale Watching</div>
              <p className="text-xs text-slate-500">Small-boat & catamaran excursions in Auke Bay.</p>
            </Link>
            <Link
              href="/ketchikan/wildlife-tours"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Ketchikan Wildlife Tours</div>
              <p className="text-xs text-slate-500">Coastal eagle safaris and rainforest sanctuaries.</p>
            </Link>
            <Link
              href="/ketchikan/kayaking"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Ketchikan Sea Kayaking</div>
              <p className="text-xs text-slate-500">Paddle Clover Pass coves with marine naturalists.</p>
            </Link>
            <Link
              href="/skagway/adventure-tours"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Skagway Adventure Tours</div>
              <p className="text-xs text-slate-500">Scooters to Dyea tidal flats and Lynn Canal vistas.</p>
            </Link>
            <Link
              href="/guides/best-alaska-cruise-ports-for-bird-watching"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Bird Watching Guide</div>
              <p className="text-xs text-slate-500">Port-by-port birding spots and species breakdown.</p>
            </Link>
            <Link
              href="/ports"
              className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-300 hover:bg-emerald-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">All Alaska Ports</div>
              <p className="text-xs text-slate-500">Compare Juneau, Ketchikan, and Skagway port calls.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
