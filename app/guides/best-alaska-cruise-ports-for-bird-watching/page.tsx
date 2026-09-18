import type { Metadata } from "next";
import Link from "next/link";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";

const canonical = "https://www.welcometoalaskatours.com/guides/best-alaska-cruise-ports-for-bird-watching";

export const metadata: Metadata = {
  title: "Best Alaska Cruise Ports for Bird Watching: Juneau, Ketchikan & Skagway (2026)",
  description:
    "A practical bird-watching guide for Alaska cruise passengers: top coastal spots near cruise docks, species breakdown, seasonal timing, independent walking routes, and excursion tips.",
  alternates: { canonical },
  openGraph: {
    title: "Best Alaska Cruise Ports for Bird Watching: Juneau, Ketchikan & Skagway (2026)",
    description:
      "A practical bird-watching guide for Alaska cruise passengers: top coastal spots near cruise docks, species breakdown, seasonal timing, independent walking routes, and excursion tips.",
    url: canonical,
    type: "article",
  },
};

const faqs = [
  {
    question: "Can you see bald eagles directly from the cruise ship in Alaska?",
    answer:
      "Yes. Southeast Alaska has one of the highest bald eagle populations in North America. In ports like Ketchikan and Juneau, bald eagles are frequently seen soaring directly over the cruise berths, perching on harbor pilings, and roosting in old-growth Sitka spruce trees along the shoreline.",
  },
  {
    question: "Where can cruise passengers see puffins in Alaska?",
    answer:
      "Tufted and Horned Puffins are pelagic seabirds that nest on remote rocky sea cliffs. While puffins are rarely spotted right at the downtown cruise docks in Juneau or Ketchikan, passengers calling at Sitka or Seward can take marine wildlife boat cruises to offshore seabird colonies (such as St. Lazaria Island near Sitka) for reliable puffin viewing.",
  },
  {
    question: "Are there dedicated bird-watching shore excursions in Alaska cruise ports?",
    answer:
      "Dedicated commercial birding tours are relatively rare in Alaska cruise ports. However, booking a small-boat whale-watching excursion in Juneau or a guided sea kayaking tour in Ketchikan puts you directly in prime pelagic and coastal feeding zones with knowledgeable naturalists. Alternatively, several premier birding locations (like Yakutania Point in Skagway) are free and easily walkable from the cruise piers.",
  },
  {
    question: "What is the best month for bird watching on an Alaska cruise?",
    answer:
      "May and early June offer the peak spring migration of shorebirds, waterfowl, and arriving songbirds along the Pacific Flyway. June and July bring active breeding and seabird colony nesting. August and September feature massive aggregations of bald eagles and gulls congregating along coastal rivers during the annual salmon spawning runs.",
  },
  {
    question: "What gear should cruise passengers pack for bird watching in Alaska?",
    answer:
      "Pack compact, waterproof binoculars (8x32 or 8x42 are ideal for boat decks and forest trails), a rainproof shell for the temperate rainforest climate, sturdy walking shoes, and a telephoto lens (200mm to 400mm+) if you plan on wildlife photography.",
  },
];

export default function BirdWatchingGuidePage() {
  const geoFact = getAlaskaGeoFact("all", "best-alaska-cruise-ports-for-bird-watching");

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
    headline: "Best Alaska Cruise Ports for Bird Watching: Juneau, Ketchikan & Skagway",
    description: metadata.description,
    datePublished: "2026-03-15",
    dateModified: "2026-09-17",
    mainEntityOfPage: canonical,
    publisher: { "@type": "Organization", name: "Welcome To Alaska Tours" },
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#e0f2fe_0%,#f8fafc_38%,#ffffff_100%)] text-slate-950 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="bg-[linear-gradient(135deg,#082f49_0%,#0f172a_58%,#164e63_100%)] px-6 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/guides" className="text-sm font-bold text-cyan-200 hover:text-white">
            {"← Alaska Guides Directory"}
          </Link>
          <div className="mt-5 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
            Alaska Cruise Wildlife & Nature Guide · 2026
          </div>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Best Alaska Cruise Ports for Bird Watching
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Southeast Alaska lies directly along the Pacific Flyway, where ancient temperate rainforests meet rich marine
            passages. Discover where cruise passengers can spot bald eagles, marbled murrelets, pigeon guillemots, and
            forest passerines—whether on a quiet self-guided walk near the pier or from a guided sea kayak or whale catamaran.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/ports"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200 shadow-md transition"
            >
              Explore Alaska Ports →
            </Link>
            <Link
              href="/ketchikan/wildlife-tours"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20 transition"
            >
              Ketchikan Wildlife Excursions
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        {/* Direct GEO Answer & Verification Card */}
        {geoFact && (
          <div className="mt-8">
            <GeoDirectAnswerCard fact={geoFact} />
          </div>
        )}

        {/* Introduction / The Birding Reality */}
        <section className="mt-8 rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-sky-800">Cruise Birding Overview</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            How Bird Watching Works on an Alaska Cruise Call
          </h2>
          <p className="text-base leading-7 text-slate-700">
            Many cruise passengers assume that bird watching in Alaska requires specialized, full-day backcountry expeditions.
            In reality, the rich marine environment of the Inside Passage means that world-class coastal, pelagic, and
            temperate-rainforest bird life can be observed right around standard cruise ports.
          </p>
          <p className="text-base leading-7 text-slate-700">
            While commercial operators in Alaska rarely offer standalone &ldquo;birding-only&rdquo; bus tours, you have two
            effective ways to experience bird life during your port hours:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="text-sm font-bold text-sky-900">1. Independent Pier-Side Walks</div>
              <p className="text-xs leading-6 text-slate-600">
                Short walks along coastal seawalls, harbor mudflats, and estuary trails located 5 to 20 minutes from the
                cruise ship docks. Zero cost and completely on your own schedule.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="text-sm font-bold text-sky-900">2. Active Marine & Wildlife Excursions</div>
              <p className="text-xs leading-6 text-slate-600">
                Small-boat whale watching catamarans (like in Juneau) and guided sea kayaking trips (like in Ketchikan)
                put you directly into pelagic feeding channels with experienced local naturalists.
              </p>
            </div>
          </div>
        </section>

        {/* Port by Port Breakdown */}
        <section className="mt-10 space-y-8">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-sky-800">Port-by-Port Locations</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Bird Watching by Port: What to See & Where to Look
            </h2>
          </div>

          {/* Juneau */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 sm:text-2xl">1. Juneau: Wetlands, Rainforest & Pelagic Waters</h3>
                <span className="text-xs font-medium text-slate-500">Capital of Alaska · Tongass Rainforest & Gastineau Channel</span>
              </div>
              <Link
                href="/juneau/whale-watching"
                className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-4"
              >
                View Juneau Marine Excursions →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2 text-sm leading-6 text-slate-700">
                <p>
                  Juneau offers remarkable habitat variety within a 20-minute radius of the cruise ship terminal. The
                  intertidal mudflats of the <strong>Mendenhall Wetlands State Game Refuge</strong> host thousands of migrating
                  waterfowl and shorebirds, while the open waters of <strong>Auke Bay and Favorite Channel</strong> are prime
                  for diving alcids and pelagic species.
                </p>
                <p>
                  If you take the Mount Roberts Tramway or hike the Gold Creek Flume trail right behind downtown Juneau,
                  you can reach subalpine and boreal forest zones where Willow Ptarmigans and Sooty Grouse can be heard.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2 text-xs text-slate-700">
                <div className="font-bold text-sky-950 uppercase tracking-wide">Juneau Fast Facts</div>
                <div><strong>Key Species:</strong> Bald Eagles, Marbled Murrelets, Pigeon Guillemots, Barrow&rsquo;s Goldeneyes, Arctic Terns, Rufous Hummingbirds, Pelagic Cormorants.</div>
                <div><strong>Prime Locations:</strong> Mendenhall Wetlands (Egan Hwy wayside / Dike Trail), Auke Bay marina, Mt. Roberts alpine trails.</div>
                <div><strong>Time Needed:</strong> 1.5–2 hours independent walk or 3.5-hour whale catamaran tour.</div>
                <div><strong>Tour Fit:</strong> Combine with <Link href="/juneau/whale-watching" className="text-sky-800 font-bold underline">Juneau Whale Watching</Link> or <Link href="/juneau/mendenhall-glacier-tours" className="text-sky-800 font-bold underline">Mendenhall Glacier tours</Link>.</div>
              </div>
            </div>
          </div>

          {/* Ketchikan */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 sm:text-2xl">2. Ketchikan: Bald Eagle Capital & Rainforest Coves</h3>
                <span className="text-xs font-medium text-slate-500">Revillagigedo Island · America&rsquo;s Rainiest Town</span>
              </div>
              <Link
                href="/ketchikan/wildlife-tours"
                className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-4"
              >
                View Ketchikan Wildlife Tours →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2 text-sm leading-6 text-slate-700">
                <p>
                  Ketchikan is famous for having one of the highest nesting densities of <strong>Bald Eagles</strong> on earth.
                  You can often spot dozens of eagles perched in old-growth red cedars and atop harbor pilings right from
                  the cruise berths (Berths 1–4) and along historic Creek Street.
                </p>
                <p>
                  For quieter, species-rich birding, the <strong>Ward Lake Trail</strong> in the Tongass National Forest (10 minutes
                  north of town) provides an easy 1.3-mile flat loop through moss-draped temperate rainforest where Pacific Wrens,
                  Varied Thrushes, and Chestnut-backed Chickadees sing throughout spring and summer. Guided sea kayaking in
                  <strong>Clover Pass</strong> lets you glide silently past shoreline Great Blue Herons, Belted Kingfishers, and Harlequin Ducks.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2 text-xs text-slate-700">
                <div className="font-bold text-sky-950 uppercase tracking-wide">Ketchikan Fast Facts</div>
                <div><strong>Key Species:</strong> Bald Eagles (dense nesting), Great Blue Herons, Belted Kingfishers, Harlequin Ducks, Pacific Wrens, Varied Thrushes, Red-breasted Sapsuckers.</div>
                <div><strong>Prime Locations:</strong> Ward Lake loop trail, Clover Pass coves, Herring Cove estuary, Creek Street boardwalk.</div>
                <div><strong>Time Needed:</strong> 1–2 hours downtown/Ward Lake or 3–4 hours kayaking.</div>
                <div><strong>Tour Fit:</strong> Pair with <Link href="/ketchikan/kayaking" className="text-sky-800 font-bold underline">Ketchikan Sea Kayaking</Link> or <Link href="/ketchikan/wildlife-tours" className="text-sky-800 font-bold underline">Coastal Wildlife & Eagle Tours</Link>.</div>
              </div>
            </div>
          </div>

          {/* Skagway */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 sm:text-2xl">3. Skagway: Estuaries, Coastal Points & Mountain Streams</h3>
                <span className="text-xs font-medium text-slate-500">Lynn Canal Terminus · Coastal Glacial Fjord</span>
              </div>
              <Link
                href="/skagway/adventure-tours"
                className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-4"
              >
                View Skagway Excursions →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2 text-sm leading-6 text-slate-700">
                <p>
                  Skagway sits at the northernmost point of Lynn Canal, where coastal marine waters give way to the rugged
                  Coast Mountains and Yukon interior. The most accessible birding spot in Southeast Alaska is <strong>Yakutania Point</strong>,
                  a flat, scenic 15-minute coastal trail starting directly across the footbridge from the cruise ship docks.
                </p>
                <p>
                  Nine miles down the coast, the <strong>Taiya River Estuary and Dyea Tidal Flats</strong> (accessible by electric scooter
                  or guided van tour) provide an important resting area for migrating sandpipers, plovers, and waterfowl. Along
                  the Lower Dewey Lake trail, listen for <strong>American Dippers</strong> diving into the fast-flowing mountain creeks.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 space-y-2 text-xs text-slate-700">
                <div className="font-bold text-sky-950 uppercase tracking-wide">Skagway Fast Facts</div>
                <div><strong>Key Species:</strong> Bonaparte&rsquo;s Gulls, Arctic Terns, American Dippers, Townsend&rsquo;s Warblers, Boreal Chickadees, Harlequin Ducks, Bald Eagles.</div>
                <div><strong>Prime Locations:</strong> Yakutania Point & Smuggler&rsquo;s Cove (walk from pier), Taiya River estuary (Dyea), Lower Dewey Lake.</div>
                <div><strong>Time Needed:</strong> 45–90 min for Yakutania walk; 2.5–3.5 hours for Dyea excursion.</div>
                <div><strong>Tour Fit:</strong> Pair with <Link href="/skagway/adventure-tours" className="text-sky-800 font-bold underline">Skagway Scooters to Dyea</Link> or scenic mountain trail walks.</div>
              </div>
            </div>
          </div>

          {/* Regional Ports: Sitka & Icy Strait Point */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 sm:text-2xl">4. Regional Port Notes: Sitka & Icy Strait Point</h3>
              <span className="text-xs font-medium text-slate-500">Additional Southeast Alaska ports on your itinerary</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 text-sm leading-6 text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                <div className="font-bold text-sky-950 text-base">Sitka (Baranof Island)</div>
                <p>
                  Sitka faces the open Pacific Ocean and is widely considered one of Alaska&rsquo;s premier seabird destinations.
                  At <strong>Sitka National Historical Park</strong>, flat trails wind through towering spruces where the Indian River
                  meets the sound. The non-profit <strong>Alaska Raptor Center</strong> provides an extraordinary close-up look at
                  rehabilitated bald eagles and owls.
                </p>
                <p className="text-xs text-slate-500">
                  <em>Seabird Highlights:</em> Boat tours into Sitka Sound can access the <strong>St. Lazaria Island National Wildlife Refuge</strong>,
                  home to thousands of nesting Tufted Puffins, Common Murres, and storm-petrels.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                <div className="font-bold text-sky-950 text-base">Icy Strait Point (Hoonah)</div>
                <p>
                  Surrounded by dense old-growth Tongass forest and the nutrient-rich channels of Icy Strait and Port Frederick,
                  this Tlingit-owned destination offers peaceful shorelines where bald eagles perch atop former cannery
                  timbers and Marbled Murrelets fish in the protected bays.
                </p>
                <p className="text-xs text-slate-500">
                  <em>Highlights:</em> Shoreline nature paths near the Wilderness Landing and Game Creek tidal wetlands
                  for shorebirds, Red-throated Loons, and coastal raptors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Calendar */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-sky-800">Seasonal Windows</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Alaska Cruise Bird Watching Calendar
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Bird activity in Southeast Alaska shifts distinctly across the May-to-September cruise season:
          </p>

          <div className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="text-sm font-bold text-sky-900">May to Early June</div>
              <div className="text-xs font-semibold text-slate-500">Spring Migration Peak</div>
              <p className="text-xs leading-5 text-slate-600">
                Millions of shorebirds, waterfowl, and songbirds travel north along the Pacific Flyway. Estuaries in Juneau and
                Skagway see high numbers of sandpipers, plovers, and Rufous Hummingbirds arriving to mate.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="text-sm font-bold text-sky-900">June to July</div>
              <div className="text-xs font-semibold text-slate-500">Active Nesting & Breeding</div>
              <p className="text-xs leading-5 text-slate-600">
                Seabird colonies are in full activity. Forest passerines (varied thrushes, wrens, warblers) sing actively in the
                Tongass rainforest. Marine waters are filled with foraging murrelets and guillemots feeding young.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2">
              <div className="text-sm font-bold text-sky-900">August to September</div>
              <div className="text-xs font-semibold text-slate-500">Salmon Run Aggregation</div>
              <p className="text-xs leading-5 text-slate-600">
                As millions of salmon return to spawn in coastal rivers, massive congregations of Bald Eagles gather along
                estuaries and gravel bars (especially at Herring Cove in Ketchikan and Gold Creek in Juneau).
              </p>
            </div>
          </div>
        </section>

        {/* Ethical Viewing Guidelines */}
        <section className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50/60 p-6 shadow-sm sm:p-8 space-y-3 text-slate-800">
          <div className="text-xs font-black uppercase tracking-widest text-amber-900">Responsible Wildlife Viewing</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Ethical Bird Watching in Southeast Alaska
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Alaska&rsquo;s wildlife is protected by state and federal regulations. Follow these ethical principles when observing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm leading-6 text-slate-700">
            <li><strong>Maintain Safe Distance:</strong> Stay at least 100 yards away from active bald eagle nests. If an eagle begins calling loudly or changes posture, you are too close.</li>
            <li><strong>No Call Playbacks:</strong> Do not use audio bird-call apps or recordings near active nesting sites, as this causes unnecessary stress during critical brooding windows.</li>
            <li><strong>Stay on Designated Trails:</strong> Fragile intertidal wetlands (like Mendenhall Refuge) and mossy rainforest floors are sensitive to erosion and trampling.</li>
            <li><strong>Be Bear Aware:</strong> Coastal estuaries and salmon streams are shared with coastal brown and black bears. Always travel in groups and remain aware of your surroundings.</li>
          </ul>
        </section>

        {/* FAQ Accordion */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-sky-800">Common Questions</div>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Frequently Asked Questions About Alaska Bird Watching
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
                  <span className="ml-4 text-sky-600 transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm leading-6 text-slate-700 border-t border-slate-100 pt-3">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Shore Excursions & Guides Navigation */}
        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-4">
          <div className="text-xs font-black uppercase tracking-widest text-sky-800">Continue Planning</div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Explore Related Alaska Shore Excursions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            <Link
              href="/juneau/whale-watching"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Juneau Whale Watching</div>
              <p className="text-xs text-slate-500">Auke Bay catamarans with pelagic seabird viewing.</p>
            </Link>
            <Link
              href="/ketchikan/wildlife-tours"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Ketchikan Wildlife Tours</div>
              <p className="text-xs text-slate-500">Coastal eagle safaris and rainforest sanctuaries.</p>
            </Link>
            <Link
              href="/ketchikan/kayaking"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Ketchikan Sea Kayaking</div>
              <p className="text-xs text-slate-500">Glide silently through Clover Pass marine coves.</p>
            </Link>
            <Link
              href="/skagway/adventure-tours"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Skagway Adventure Tours</div>
              <p className="text-xs text-slate-500">Electric scooters to the Dyea tidal flats.</p>
            </Link>
            <Link
              href="/guides/easy-alaska-shore-excursions"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">Easy Shore Excursions</div>
              <p className="text-xs text-slate-500">Low-walking and scenic port-day options.</p>
            </Link>
            <Link
              href="/guides"
              className="rounded-2xl border border-slate-200 p-4 hover:border-sky-300 hover:bg-sky-50 transition block space-y-1"
            >
              <div className="text-sm font-bold text-slate-900">All Alaska Guides</div>
              <p className="text-xs text-slate-500">Port decisions, safety buffers, and excursion tips.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
