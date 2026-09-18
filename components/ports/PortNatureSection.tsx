import Link from "next/link";

export interface PortNatureData {
  portSlug: string;
  portName: string;
  birds: {
    heading: string;
    summary: string;
    keySpecies: string[];
    topLocations: string[];
    timeNeeded: string;
    accessType: "Self-guided walk" | "Excursion recommended" | "Walk or boat tour";
    seasonWindow: string;
    linkHref: string;
    linkLabel: string;
  };
  aurora: {
    heading: string;
    summary: string;
    seasonWindow: string;
    darknessReality: string;
    viewingConditions: string;
    viewingLocation: string;
  };
  whales: {
    heading: string;
    summary: string;
    opportunityLevel: "High Seasonal Opportunity (Boat Excursion)" | "Moderate Opportunity (Marine Excursions)" | "Occasional Marine Transit Opportunity";
    primeSpecies: string[];
    bestWindow: string;
    waterAccess: string;
    linkHref: string;
    linkLabel: string;
  };
}

export const PORT_NATURE_REGISTRY: Record<string, PortNatureData> = {
  juneau: {
    portSlug: "juneau",
    portName: "Juneau",
    birds: {
      heading: "Bird Watching in Juneau",
      summary:
        "Juneau features diverse coastal and alpine habitats within 20 minutes of the cruise terminal. The intertidal mudflats of the Mendenhall Wetlands State Game Refuge host migrating shorebirds and waterfowl, while Auke Bay and Favorite Channel support pelagic alcids and bald eagles.",
      keySpecies: ["Bald Eagles", "Marbled Murrelets", "Pigeon Guillemots", "Barrow's Goldeneyes", "Arctic Terns", "Rufous Hummingbirds", "Willow Ptarmigan"],
      topLocations: ["Mendenhall Wetlands State Game Refuge (Dike Trail / Egan Hwy)", "Auke Bay & Favorite Channel marine waters", "Mount Roberts subalpine trails"],
      timeNeeded: "1.5–2 hours on foot or 3.5-hour whale boat catamaran",
      accessType: "Walk or boat tour",
      seasonWindow: "May migration peak • June–July nesting • August–September salmon run eagle aggregations",
      linkHref: "/juneau/whale-watching",
      linkLabel: "Juneau Whale & Marine Tours",
    },
    aurora: {
      heading: "Northern Lights in Juneau",
      summary:
        "Juneau sits beneath the auroral oval, but midsummer cruise calls (May through July) experience 17 to 19 hours of daylight with no true night darkness. Aurora visibility becomes seasonally possible from late August through September.",
      seasonWindow: "Late August through September only (May–July is too bright)",
      darknessReality: "Requires true night darkness (11:00 PM to 3:30 AM), away from downtown dock lighting.",
      viewingConditions: "Requires strong geomagnetic solar activity (Kp 3+) and clear, cloudless skies (Juneau averages frequent coastal cloud cover).",
      viewingLocation: "Best observed from the dark upper open decks of your cruise ship after sailing out of Gastineau Channel into open straits.",
    },
    whales: {
      heading: "Whale-Viewing Opportunities in Juneau",
      summary:
        "Juneau is Southeast Alaska's premier whale-watching port. The nutrient-rich waters of Auke Bay, Favorite Channel, and Saginaw Channel serve as protected summer feeding grounds where humpback whales gorge on schooling herring and krill.",
      opportunityLevel: "High Seasonal Opportunity (Boat Excursion)",
      primeSpecies: ["Humpback Whales (bubble-net feeding, breaching, fluking)", "Killer Whales / Orcas (transient & resident pods)", "Dall's Porpoises", "Steller Sea Lions"],
      bestWindow: "May through September (consistent daily feeding activity)",
      waterAccess: "20-minute shuttle from cruise terminal to Auke Bay marina for dedicated 3 to 3.5-hour heated catamaran tours.",
      linkHref: "/juneau/whale-watching",
      linkLabel: "Compare Juneau Whale Watching Tours",
    },
  },
  ketchikan: {
    portSlug: "ketchikan",
    portName: "Ketchikan",
    birds: {
      heading: "Bird Watching in Ketchikan",
      summary:
        "Surrounded by the old-growth Tongass National Forest, Ketchikan has one of the highest nesting densities of Bald Eagles in North America. Eagles are easily seen perching on harbor pilings and spruce trees right at the cruise berths, while Ward Lake and Clover Pass offer quiet rainforest songbird and waterfowl observation.",
      keySpecies: ["Bald Eagles (dense nesting)", "Great Blue Herons", "Belted Kingfishers", "Harlequin Ducks", "Pacific Wrens", "Varied Thrushes", "Red-breasted Sapsuckers"],
      topLocations: ["Creek Street & downtown harbor pilings", "Ward Lake Nature Trail (1.3-mile flat loop)", "Clover Pass marine coves", "Herring Cove estuary"],
      timeNeeded: "1–2 hours downtown/Ward Lake or 3–4 hours sea kayaking",
      accessType: "Walk or boat tour",
      seasonWindow: "Year-round eagle presence • May spring songbird arrival • August–September salmon run aggregations",
      linkHref: "/ketchikan/wildlife-tours",
      linkLabel: "Ketchikan Wildlife & Eagle Excursions",
    },
    aurora: {
      heading: "Northern Lights in Ketchikan",
      summary:
        "As the southernmost major port in Southeast Alaska, Ketchikan receives slightly more nighttime hours in late summer than northern ports, but high annual precipitation and persistent cloud cover make aurora sightings infrequent during standard cruise calls.",
      seasonWindow: "Late August through September only (May–July lacks required darkness)",
      darknessReality: "Needs complete darkness (after 10:30 PM), well away from town and cruise berth illumination.",
      viewingConditions: "Requires cloud-free skies (challenging in America's rainiest city) and elevated geomagnetic activity (Kp 4+).",
      viewingLocation: "Open cruise ship decks at night while navigating Clarence Strait or Revillagigedo Channel under clear skies.",
    },
    whales: {
      heading: "Whale-Viewing Opportunities in Ketchikan",
      summary:
        "Whales navigate the deep marine channels around Ketchikan, including Tongass Narrows and Clarence Strait. While migrating humpbacks and transient orca pods are regularly spotted, Ketchikan excursions focus on comprehensive coastal wildlife (bears, eagles, seals) rather than dedicated whale catamarans.",
      opportunityLevel: "Moderate Opportunity (Marine Excursions)",
      primeSpecies: ["Humpback Whales (migrating pods)", "Orcas (transient pods hunting marine mammals)", "Harbor Seals", "Pacific White-sided Dolphins"],
      bestWindow: "June through September",
      waterAccess: "Guided sea kayaking in Clover Pass or coastal Zodiac safaris exploring island channels.",
      linkHref: "/ketchikan/kayaking",
      linkLabel: "Explore Ketchikan Sea Kayaking",
    },
  },
  skagway: {
    portSlug: "skagway",
    portName: "Skagway",
    birds: {
      heading: "Bird Watching in Skagway",
      summary:
        "Where Lynn Canal meets the Coast Mountains, Skagway offers convenient access to coastal, boreal, and subalpine bird species. Yakutania Point is a flat 15-minute walk directly from the cruise docks, while the Taiya River estuary in Dyea provides critical feeding grounds for migrating shorebirds and waterfowl.",
      keySpecies: ["Bonaparte's Gulls", "Arctic Terns", "American Dippers (mountain streams)", "Harlequin Ducks", "Townsend's Warblers", "Boreal Chickadees", "Bald Eagles"],
      topLocations: ["Yakutania Point & Smuggler's Cove (direct walk from pier)", "Taiya River estuary & Dyea Tidal Flats", "Lower Dewey Lake trail"],
      timeNeeded: "45–90 minutes walking from pier; 2.5–3.5 hours for Dyea excursion",
      accessType: "Self-guided walk",
      seasonWindow: "May–June spring migration across Dyea flats • Summer alpine breeding along mountain passes",
      linkHref: "/skagway/adventure-tours",
      linkLabel: "Skagway Adventure & Dyea Tours",
    },
    aurora: {
      heading: "Northern Lights in Skagway",
      summary:
        "Skagway's northern latitude makes it well positioned for aurora viewing, but that same latitude creates nearly 20 hours of daylight in June and July. Late August and September bring the crisp, dark night skies necessary for potential northern lights displays.",
      seasonWindow: "Late August and September (true darkness returns after 10:30 PM)",
      darknessReality: "Requires dark skies with minimal moonlight and distance from town and harbor lights.",
      viewingConditions: "Skagway's rain-shadow climate often delivers clearer skies than Juneau or Ketchikan, providing favorable weather if solar activity (Kp 3+) occurs.",
      viewingLocation: "Upper ship decks after evening departure down Lynn Canal, or Yakutania Point during late-night port calls.",
    },
    whales: {
      heading: "Whale-Viewing Opportunities in Skagway",
      summary:
        "Lynn Canal is the longest and deepest fjord in North America, acting as a natural migration corridor. Humpback whales and orcas travel through the fjord, making scenic cruise sail-in and sail-out transit through Lynn Canal one of the best times to watch for blows and tail flukes from the ship.",
      opportunityLevel: "Occasional Marine Transit Opportunity",
      primeSpecies: ["Humpback Whales (seasonal corridor transit)", "Orcas (roaming pods)", "Harbor Seals"],
      bestWindow: "May through September (especially during early morning or evening transit through Lynn Canal)",
      waterAccess: "Open cruise ship observation decks during Lynn Canal transit or ocean raft and ferry tours.",
      linkHref: "/ports/skagway",
      linkLabel: "All Skagway Shore Excursions",
    },
  },
};

export default function PortNatureSection({ portSlug }: { portSlug: string }) {
  const data = PORT_NATURE_REGISTRY[portSlug.toLowerCase()];
  if (!data) return null;

  return (
    <section className="mt-12 rounded-[2.5rem] border border-emerald-100 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_35%)] p-6 sm:p-10 shadow-sm space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-800">
            Wildlife & Phenomena Guide · 2026
          </div>
          <Link
            href="/guides/alaska-nature-by-cruise-port"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
          >
            All-Port Nature Guide →
          </Link>
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {data.portName} Nature by Port: Birds, Aurora & Whales
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Practical, realistic cruise-day guidance on when and where you can observe Southeast Alaska&rsquo;s signature wildlife
          and natural phenomena. Sightings and aurora visibility depend on season, weather, and tides and are never guaranteed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Bird Watching */}
        <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                🦅 Bird Watching
              </span>
              <span className="text-[11px] font-semibold text-slate-500">{data.birds.accessType}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">{data.birds.heading}</h3>
            <p className="text-xs leading-5 text-slate-600">{data.birds.summary}</p>

            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700 border border-slate-100">
              <div>
                <strong>Key Species:</strong> {data.birds.keySpecies.slice(0, 4).join(", ")} + more
              </div>
              <div>
                <strong>Top Spots:</strong> {data.birds.topLocations[0]}
              </div>
              <div>
                <strong>Time Needed:</strong> {data.birds.timeNeeded}
              </div>
              <div>
                <strong>Best Window:</strong> {data.birds.seasonWindow}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link href={data.birds.linkHref} className="text-xs font-bold text-emerald-800 hover:text-emerald-950">
              {data.birds.linkLabel} →
            </Link>
            <Link
              href="/guides/best-alaska-cruise-ports-for-bird-watching"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              Birding Guide
            </Link>
          </div>
        </div>

        {/* Card 2: Northern Lights */}
        <div className="rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-800">
                🌌 Northern Lights
              </span>
              <span className="text-[11px] font-semibold text-amber-700">Late Season Only</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">{data.aurora.heading}</h3>
            <p className="text-xs leading-5 text-slate-600">{data.aurora.summary}</p>

            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700 border border-slate-100">
              <div>
                <strong>Seasonality:</strong> {data.aurora.seasonWindow}
              </div>
              <div>
                <strong>Darkness:</strong> {data.aurora.darknessReality}
              </div>
              <div>
                <strong>Conditions:</strong> {data.aurora.viewingConditions}
              </div>
              <div>
                <strong>Best Vantage:</strong> {data.aurora.viewingLocation}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 italic">Sightings require dark, clear skies</span>
            <Link
              href="/guides/alaska-nature-by-cruise-port#aurora"
              className="text-xs font-bold text-indigo-800 hover:text-indigo-950"
            >
              Aurora Guide →
            </Link>
          </div>
        </div>

        {/* Card 3: Whale Opportunities */}
        <div className="rounded-2xl border border-sky-200/80 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold text-sky-800">
                🐋 Whale Viewing
              </span>
              <span className="text-[11px] font-semibold text-sky-700">May–September</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">{data.whales.heading}</h3>
            <p className="text-xs leading-5 text-slate-600">{data.whales.summary}</p>

            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs text-slate-700 border border-slate-100">
              <div>
                <strong>Opportunity:</strong> {data.whales.opportunityLevel}
              </div>
              <div>
                <strong>Key Species:</strong> {data.whales.primeSpecies.slice(0, 3).join(", ")}
              </div>
              <div>
                <strong>Best Months:</strong> {data.whales.bestWindow}
              </div>
              <div>
                <strong>Water Access:</strong> {data.whales.waterAccess}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link href={data.whales.linkHref} className="text-xs font-bold text-sky-800 hover:text-sky-950">
              {data.whales.linkLabel} →
            </Link>
            <Link
              href="/guides/alaska-nature-by-cruise-port#whales"
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
            >
              Whale Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
