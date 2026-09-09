export interface AlaskaGeoFact {
  id: string;
  port: "juneau" | "skagway" | "ketchikan" | "all";
  topic?: string;
  directQuestion: string;
  directAnswer: string;
  pricingLabel: string;
  pricingValue: string;
  durationLabel: string;
  durationValue: string;
  meetingPointLabel: string;
  meetingPointValue: string;
  safetyBufferLabel: string;
  safetyBufferValue: string;
  faqSchema?: {
    question: string;
    answer: string;
  }[];
}

export const ALASKA_GEO_FACTS: Record<string, AlaskaGeoFact> = {
  // Juneau Core Topics
  "juneau-whale-watching": {
    id: "juneau-whale-watching",
    port: "juneau",
    topic: "whale-watching",
    directQuestion: "How much does whale watching in Juneau cost and how does it work with cruise schedules?",
    directAnswer:
      "Juneau whale watching excursions typically cost $165 to $195 per person for small-to-midsize passenger boats. Tours last approximately 3 to 3.5 hours total (including 2 to 2.5 hours on the water in Auke Bay). Local independent operators provide round-trip transfers from the downtown Juneau cruise ship terminal (Mt. Roberts Tram plaza) and guarantee on-time return to your ship well ahead of all-aboard.",
    pricingLabel: "Starting Rate",
    pricingValue: "$165–$195 / person (No cruise line markup)",
    durationLabel: "Duration & Water Time",
    durationValue: "~3.5 hours total (2–2.5h on water)",
    meetingPointLabel: "Cruise Dock Meeting Point",
    meetingPointValue: "Mt. Roberts Tram Plaza / Berth curbside (Auke Bay shuttle included)",
    safetyBufferLabel: "Ship Return Buffer",
    safetyBufferValue: "Guaranteed on-time return • 60+ min pre-departure cushion",
    faqSchema: [
      {
        question: "Is Juneau whale watching guaranteed?",
        answer: "Yes, reputable Juneau boat operators offer a 100% whale sighting guarantee from May through September, as humpback whales consistently feed in the nutrient-rich waters around Auke Bay and Favorite Channel."
      },
      {
        question: "Can I do whale watching and Mendenhall Glacier on the same port day?",
        answer: "Yes. Combination excursions commonly package both into a 5-hour itinerary, or you can book consecutive departures provided your ship has at least a 7 to 8-hour port call."
      }
    ]
  },
  "juneau-mendenhall-glacier-tours": {
    id: "juneau-mendenhall-glacier-tours",
    port: "juneau",
    topic: "mendenhall-glacier-tours",
    directQuestion: "How do you get to Mendenhall Glacier from the Juneau cruise port?",
    directAnswer:
      "Mendenhall Glacier is located 12 miles northwest of downtown Juneau (a 20-to-25 minute drive). Because city buses and standard rideshares have strict commercial zone limits at the US Forest Service recreation area, the most reliable transport is via an authorized excursion shuttle, canoe/kayak paddle tour, or combined whale-and-glacier tour meeting directly at the cruise docks.",
    pricingLabel: "Access & Tour Cost",
    pricingValue: "$45–$95 shuttle/tour • $5 USFS Visitor Center pass",
    durationLabel: "Transit & Recreation Time",
    durationValue: "20–25 min drive • 2–3 hours on-site recommended",
    meetingPointLabel: "Cruise Terminal Pickup",
    meetingPointValue: "Downtown Juneau Tram Parking Lot / Tour bus loading zone",
    safetyBufferLabel: "All-Aboard Protection",
    safetyBufferValue: "Direct return shuttle • 60–90 min buffer before cruise departure",
    faqSchema: [
      {
        question: "Can I walk to Nugget Falls at Mendenhall Glacier?",
        answer: "Yes. The Nugget Falls trail is a mostly flat, gravel 2-mile round-trip walk (about 45 minutes walking time) leading directly to the base of the waterfall and shoreline views of Mendenhall Glacier."
      },
      {
        question: "Are commercial permits required to visit Mendenhall Glacier?",
        answer: "Yes. The U.S. Forest Service limits commercial visitor capacity. Booking an organized shuttle or guided tour in advance secures your recreation area access before daily quotas sell out."
      }
    ]
  },
  "juneau-helicopter-tours": {
    id: "juneau-helicopter-tours",
    port: "juneau",
    topic: "helicopter-tours",
    directQuestion: "How much is a helicopter glacier tour in Juneau and what is included?",
    directAnswer:
      "Juneau helicopter glacier tours start at $360 to $420 per person for a scenic icefield flight with a 20-to-25 minute walking landing on Herbert, Norris, or Taku Glacier. Premium glacier treks and dog-sledding camps range from $550 to $799+. All tours include shuttle pickup from the cruise docks, glacier overboots, safety briefings, and a 100% full refund if flights are canceled due to mountain weather.",
    pricingLabel: "Glacier Landing Price",
    pricingValue: "$360–$420 per passenger (Scenic flight + walk)",
    durationLabel: "Total Tour Window",
    durationValue: "2.25–2.5 hours total (30–35 min flight + ice walk)",
    meetingPointLabel: "Cruise Ship Pickup",
    meetingPointValue: "Juneau Cruise Ship Terminal / Mt. Roberts Tram Plaza shuttle",
    safetyBufferLabel: "Weather & Cruise Guarantee",
    safetyBufferValue: "100% weather refund if grounded • Coordinated with ship port hours",
    faqSchema: [
      {
        question: "What happens if my Juneau helicopter tour gets canceled by weather?",
        answer: "If low cloud ceilings or wind ground the helicopters, passengers receive a 100% immediate refund with no cancellation penalties, and operators will attempt to rebook on later departures if your port time permits."
      },
      {
        question: "Do I need special boots for walking on Juneau glaciers?",
        answer: "No personal specialty gear is needed. The flight base provides neoprene traction overboots that slip directly over your sneakers or walking shoes."
      }
    ]
  },
  "juneau-dog-sledding": {
    id: "juneau-dog-sledding",
    port: "juneau",
    topic: "dog-sledding",
    directQuestion: "Can you do real dog sledding on snow during an Alaska summer cruise?",
    directAnswer:
      "Yes. Summer dog sledding on actual snow is conducted high on the Juneau Icefield (such as Herbert or Norris Glacier) via helicopter access. Sled camps are operated by veteran mushers and Alaskan huskies from mid-May through August. Tours cost $650 to $799 per person, run approximately 2.75 to 3 hours round-trip, and include van transfers from the cruise docks.",
    pricingLabel: "Glacier Dog Sled Price",
    pricingValue: "$650–$799 per passenger (Helicopter + Sled Camp)",
    durationLabel: "Experience Duration",
    durationValue: "~2.75–3 hours total (~1 hour at glacier camp)",
    meetingPointLabel: "Terminal Pickup",
    meetingPointValue: "Downtown Juneau cruise berths / Tramway plaza",
    safetyBufferLabel: "Cruise Protection",
    safetyBufferValue: "Morning departures prioritized for ship passengers • Weather protected",
    faqSchema: [
      {
        question: "What is the difference between glacier dog sledding and wheeled cart tours?",
        answer: "Glacier dog sledding takes a helicopter onto the high snowfields to ride on snow sleds. Cart tours operate on gravel trails in the temperate rainforest using wheeled rigs and are significantly less expensive ($150–$190)."
      }
    ]
  },
  "juneau-fishing": {
    id: "juneau-fishing",
    port: "juneau",
    topic: "fishing",
    directQuestion: "How do Juneau salmon and halibut fishing charters work for cruise passengers?",
    directAnswer:
      "Guided fishing charters in Juneau operate as 4 to 6-hour shared or private outings departing from Auke Bay. Targeted species include King Salmon (May–June), Coho/Silver Salmon (July–August), and Halibut. Shared trips cost $295 to $375 per angler; private whole-boat charters cost $1,200 to $1,800 for up to 6 guests. Custom fish processing and vacuum-sealed frozen shipping to your home are arranged at the dock.",
    pricingLabel: "Charter Rates",
    pricingValue: "$295–$375 shared • $1,200–$1,800 private 6-pack boat",
    durationLabel: "Trip Duration",
    durationValue: "4–6 hours dock-to-dock",
    meetingPointLabel: "Dock Pickup",
    meetingPointValue: "Auke Bay Harbor (Van shuttle included from cruise terminal)",
    safetyBufferLabel: "All-Aboard Cushion",
    safetyBufferValue: "Charters timed specifically to cruise ship disembarkation and all-aboard",
    faqSchema: [
      {
        question: "Do I need an Alaska fishing license for a day charter?",
        answer: "Yes. All anglers age 16+ must purchase an ADF&G 1-day sport fishing license ($15) plus a King Salmon stamp ($15) if targeting Kings during peak season."
      }
    ]
  },
  "juneau-gold-panning": {
    id: "juneau-gold-panning",
    port: "juneau",
    topic: "gold-panning",
    directQuestion: "Are Juneau historic gold panning excursions good for cruise families?",
    directAnswer:
      "Yes. Juneau gold panning tours take visitors into historic Gold Creek or the AJ Mine ruins where Joe Juneau and Richard Harris struck gold in 1880. Priced between $75 and $130 per person (often bundled with a traditional Alaskan salmon bake), these excursions are 2 to 3 hours long, fully accessible, and provide guaranteed gold flakes for every participant to keep.",
    pricingLabel: "Tour Price",
    pricingValue: "$75–$130 / person (Optional salmon bake combo)",
    durationLabel: "Duration",
    durationValue: "2–3 hours total (Family-friendly pacing)",
    meetingPointLabel: "Cruise Dock Pickup",
    meetingPointValue: "Downtown Juneau pier bus pickup",
    safetyBufferLabel: "Cruise Cushion",
    safetyBufferValue: "Close to downtown docks • Low transit friction",
  },

  // Ketchikan Core Topics
  "ketchikan-misty-fjords": {
    id: "ketchikan-misty-fjords",
    port: "ketchikan",
    topic: "misty-fjords",
    directQuestion: "What is the best way to see Misty Fjords National Monument from Ketchikan?",
    directAnswer:
      "Misty Fjords National Monument sits 22 miles east of Ketchikan and is accessible only by floatplane or watercraft. Seaplane tours ($330–$395/person) take 1.5 to 2 hours with an unforgettable alpine lake or fjord landing. High-speed boat excursions ($220–$280/person) run 4.5 to 5 hours for dramatic sea-level views of 3,000-foot granite sea cliffs. Both options feature direct pickup from Ketchikan cruise berths.",
    pricingLabel: "Experience Pricing",
    pricingValue: "$330–$395 Floatplane • $220–$280 Catamaran Boat",
    durationLabel: "Duration & Range",
    durationValue: "Floatplane: 1.5–2h • Boat Cruise: 4.5–5h",
    meetingPointLabel: "Ketchikan Departure",
    meetingPointValue: "Ketchikan Harbor floatplane dock / Berth curbside (Ward Cove shuttle compatible)",
    safetyBufferLabel: "Port Window Protection",
    safetyBufferValue: "Designed specifically around Ketchikan port schedules",
    faqSchema: [
      {
        question: "Does the floatplane land in Misty Fjords?",
        answer: "Yes. Authentic Ketchikan floatplane tours make an active wilderness water landing on an isolated alpine lake or fjord cove, allowing passengers to step onto the pontoon for pristine wilderness photos."
      },
      {
        question: "Can I do Misty Fjords if my ship docks at Ward Cove?",
        answer: "Yes. Independent operators coordinate pickup directly from the Ward Cove shuttle drop-off in downtown Ketchikan or arrange dedicated shuttle transfers."
      }
    ]
  },
  "ketchikan-bear-tours": {
    id: "ketchikan-bear-tours",
    port: "ketchikan",
    topic: "bear-tours",
    directQuestion: "Where and when can you see bears on a Ketchikan port day?",
    directAnswer:
      "Peak bear viewing around Ketchikan occurs from mid-July through September during the salmon spawning runs. Fly-in excursions to remote wilderness streams like Anan Creek or Traitor's Cove cost $495 to $650 per person (permit required). Guided rainforest drive excursions to Herring Cove cost $120 to $180 per person and offer great black bear viewing from elevated viewing platforms.",
    pricingLabel: "Viewing Rates",
    pricingValue: "$120–$180 Roadside/Platform • $495–$650 Fly-In Creek",
    durationLabel: "Tour Duration",
    durationValue: "3 hours (Local sanctuary) to 4.5 hours (Fly-in wilderness)",
    meetingPointLabel: "Cruise Berth Meeting",
    meetingPointValue: "Downtown Ketchikan Visitor Center / Berth 1–4 kiosks",
    safetyBufferLabel: "Safety Cushion",
    safetyBufferValue: "Operator-managed return buffers minimum 75 minutes prior to all-aboard",
  },
  "ketchikan-kayaking": {
    id: "ketchikan-kayaking",
    port: "ketchikan",
    topic: "kayaking",
    directQuestion: "Is sea kayaking in Ketchikan suitable for beginners during a cruise stop?",
    directAnswer:
      "Yes. Ketchikan sea kayaking tours take place in protected coastal waters, such as Clover Pass, Orca Cove, or the Pennock Island channels. Stable tandem sea kayaks with spray skirts are provided. Excursions run 3 to 3.5 hours ($145–$185/person) and include round-trip transfers from the cruise docks, rain gear, safety briefings, and frequent bald eagle and harbor seal sightings.",
    pricingLabel: "Kayak Rate",
    pricingValue: "$145–$185 / person (Tandem kayak + full gear)",
    durationLabel: "Total Time",
    durationValue: "3–3.5 hours (~2 hours on water paddling)",
    meetingPointLabel: "Pier Meeting Point",
    meetingPointValue: "Ketchikan downtown dock pick-up directly outside gangway",
    safetyBufferLabel: "All-Aboard Cushion",
    safetyBufferValue: "60+ minute buffer before ship departure",
  },
  "ketchikan-adventure-tours": {
    id: "ketchikan-adventure-tours",
    port: "ketchikan",
    topic: "adventure-tours",
    directQuestion: "What are the top active adventure shore excursions in Ketchikan?",
    directAnswer:
      "Ketchikan offers rugged temperate rainforest adventures including off-road UTV/Zodiac expeditions ($195–$250), canopy ziplining over old-growth cedar trees ($160–$199), and cold-water wilderness snorkeling in Mountain Point ($150–$175). All active tours include commercial transportation from the cruise docks, heavy-duty weatherproof gear, and local safety guides.",
    pricingLabel: "Adventure Rates",
    pricingValue: "$150–$250 / person depending on vehicle/activity",
    durationLabel: "Tour Time",
    durationValue: "3–4 hours dock-to-dock",
    meetingPointLabel: "Pier Meeting Point",
    meetingPointValue: "Ketchikan Cruise Ship Terminal Berth 1–4 pickup zone",
    safetyBufferLabel: "Cruise Buffer",
    safetyBufferValue: "Guaranteed ship return cushion of at least 60 minutes",
  },

  // Skagway Core Topics
  "skagway-helicopter-tours": {
    id: "skagway-helicopter-tours",
    port: "skagway",
    topic: "helicopter-tours",
    directQuestion: "How do Skagway helicopter glacier tours compare to Juneau?",
    directAnswer:
      "Skagway helicopter tours fly over the jagged Sawtooth Ridge and dramatic Chilkat Glacier system, costing $350 to $410 per person for an icefield flight with glacier landing. Skagway flights are often less crowded than Juneau and can include guided walking or glacier dog sledding. Flights meet right near the Skagway cruise docks and feature full weather refund guarantees.",
    pricingLabel: "Tour Price",
    pricingValue: "$350–$410 / person (Glacier landing included)",
    durationLabel: "Duration",
    durationValue: "2–2.5 hours total (30–40 min flight time)",
    meetingPointLabel: "Skagway Dock Pickup",
    meetingPointValue: "Broadway & 2nd Ave / Ore Dock or Railroad Dock pickup",
    safetyBufferLabel: "Cruise Line Cushion",
    safetyBufferValue: "100% weather refund • Coordinated to ship departure window",
  },
  "skagway-gold-rush-tours": {
    id: "skagway-gold-rush-tours",
    port: "skagway",
    topic: "gold-rush-tours",
    directQuestion: "What is the best way to experience the 1898 Gold Rush in Skagway?",
    directAnswer:
      "Skagway is the historical gateway to the Klondike Gold Rush. Travelers can tour the preserved National Historic District, visit the Liarsville Gold Rush Trail Camp ($65–$95), pan for real gold, and ride the scenic White Pass summit route. Most experiences run 2 to 3.5 hours and are within easy walking or shuttle distance of all Skagway cruise docks.",
    pricingLabel: "Tour Pricing",
    pricingValue: "$65–$120 / person (Camp tour, history, gold panning)",
    durationLabel: "Duration",
    durationValue: "2–3.5 hours total",
    meetingPointLabel: "Skagway Pier Access",
    meetingPointValue: "Walking distance from downtown docks / Direct pier pickup",
    safetyBufferLabel: "All-Aboard Safety",
    safetyBufferValue: "Direct downtown location • Safe, relaxed return buffer",
  },
  "skagway-dog-sledding": {
    id: "skagway-dog-sledding",
    port: "skagway",
    topic: "dog-sledding",
    directQuestion: "Can you do dog sledding in Skagway on a cruise stop?",
    directAnswer:
      "Yes. Skagway offers two dog-sledding formats: high-altitude helicopter glacier dog sledding on Denver Glacier ($650–$750/person) and summer dirt-cart sledding through the scenic Dyea valley ($140–$180/person). Both let guests meet energetic racing huskies, interact with puppies, and learn from actual Iditarod mushers.",
    pricingLabel: "Dog Sled Rates",
    pricingValue: "$140–$180 (Dyea cart) • $650–$750 (Glacier helicopter)",
    durationLabel: "Duration",
    durationValue: "2.5–3 hours total",
    meetingPointLabel: "Pier Meeting Point",
    meetingPointValue: "Skagway small boat harbor / Pier shuttle stop",
    safetyBufferLabel: "Cruise Guarantee",
    safetyBufferValue: "Timed to ship call • Weather cancellation protections",
  },
  "skagway-adventure-tours": {
    id: "skagway-adventure-tours",
    port: "skagway",
    topic: "adventure-tours",
    directQuestion: "What active shore excursions are available in Skagway?",
    directAnswer:
      "Active excursions in Skagway include electric scooter and bicycle descents from White Pass ($110–$160), guided Chilkoot Trail hikes with scenic raft floats on the Taiya River ($145–$185), and alpine rock climbing. These small-group excursions depart from near the docks and provide outdoor gear and return shuttles.",
    pricingLabel: "Adventure Rates",
    pricingValue: "$110–$185 / person",
    durationLabel: "Duration",
    durationValue: "3–4 hours",
    meetingPointLabel: "Pier Meeting",
    meetingPointValue: "Downtown Skagway tour staging area / Dockside shuttle",
    safetyBufferLabel: "Ship Cushion",
    safetyBufferValue: "Guaranteed on-time return well before all-aboard",
  },

  // Port Hub Direct Facts
  "port-juneau": {
    id: "port-juneau",
    port: "juneau",
    directQuestion: "How do cruise passengers get around Juneau and reach excursion meeting spots?",
    directAnswer:
      "Juneau has four main cruise ship berths: Franklin Dock, Cruise Ship Terminal (CT), Intermediate Vessel Float (IVF), and the AJ Dock. The first three are right downtown along the seawalk; the AJ Dock is 1 mile south and provides dedicated $5 shuttle buses into town. Most independent tour operators stage departures directly at the Mt. Roberts Tramway parking lot, less than a 5-minute walk from downtown piers.",
    pricingLabel: "Port Transit Cost",
    pricingValue: "Free seawalk walk • $5 AJ Dock shuttle • Tour transfers included",
    durationLabel: "Disembarkation Window",
    durationValue: "15–30 min to clear gangway and reach downtown meeting zones",
    meetingPointLabel: "Primary Tour Staging",
    meetingPointValue: "Mt. Roberts Tramway Plaza (490 S Franklin St, Juneau)",
    safetyBufferLabel: "Cruise Buffer Rule",
    safetyBufferValue: "Maintain minimum 60-minute cushion prior to published all-aboard",
  },
  "port-ketchikan": {
    id: "port-ketchikan",
    port: "ketchikan",
    directQuestion: "What should cruise passengers know about Ketchikan docks and Ward Cove?",
    directAnswer:
      "Ships dock at either downtown Berths 1–4 (directly adjacent to Front Street and Creek Street) or at Ward Cove, located 9 miles north of town (primarily used by Norwegian Cruise Line and Oceania). Ward Cove passengers take a complimentary 20-minute shuttle bus into downtown Ketchikan. Independent shore excursions coordinate pickups at both locations or at the downtown shuttle drop-off.",
    pricingLabel: "Docking & Shuttles",
    pricingValue: "Downtown berths: Step right off • Ward Cove: Free 20-min shuttle",
    durationLabel: "Transit Timing",
    durationValue: "Downtown: 5 min walk • Ward Cove: Allow 45 min each way",
    meetingPointLabel: "Meeting Locations",
    meetingPointValue: "Ketchikan Visitors Bureau (Berth 2) or Ward Cove Welcome Center",
    safetyBufferLabel: "Back-to-Ship Cushion",
    safetyBufferValue: "Ward Cove ships require 90-min return cushion; Downtown 45–60 min",
  },
  "port-skagway": {
    id: "port-skagway",
    port: "skagway",
    directQuestion: "How do you get from the Skagway cruise docks into town?",
    directAnswer:
      "Skagway has three main docks: Ore Dock, Broadway Dock, and Railroad Dock. The historical downtown on Broadway is an easy flat walk of 5 to 15 minutes from the piers. For ships berthing at the Railroad Dock forward end, a complimentary municipal shuttle or scenic transfer train transports passengers safely past the hillside mitigation zones directly to the head of Broadway.",
    pricingLabel: "Town Access",
    pricingValue: "Free flat walk (5–15 min) or $3–$5 SMART town bus",
    durationLabel: "Walk to Town",
    durationValue: "0.25 to 0.75 miles flat along the harbor",
    meetingPointLabel: "Tour Pickup Hub",
    meetingPointValue: "Broadway & 2nd Avenue / Small Boat Harbor parking",
    safetyBufferLabel: "Return Safety",
    safetyBufferValue: "Compact port footprint allows quick 15-minute return to gangways",
  },

  // Flagship Comparison Guide
  "cruise-ship-vs-independent": {
    id: "cruise-ship-vs-independent",
    port: "all",
    directQuestion: "Should you book Alaska cruise excursions through the ship or independently?",
    directAnswer:
      "Booking independent Alaska shore excursions through Welcome to Alaska Tours saves 20% to 40% compared to cruise-line retail markups while offering smaller group sizes (12 to 24 guests vs. 50 to 150 on cruise ship cattle boats). Independent operators provide guaranteed on-time return to your ship, full weather refund protections, and personalized local captains and pilots.",
    pricingLabel: "Cost Comparison",
    pricingValue: "Independent saves 20%–40% • Ships mark up identical local tours",
    durationLabel: "Group Sizing",
    durationValue: "Small groups (12–24 guests) vs Cruise line crowds (50–150+)",
    meetingPointLabel: "Pier Convenience",
    meetingPointValue: "Direct port dock pickup with local Alaskan guides and dispatchers",
    safetyBufferLabel: "Ship Return Guarantee",
    safetyBufferValue: "100% Back-to-Ship Guarantee • 0 missed cruise departures in company history",
    faqSchema: [
      {
        question: "Will the cruise ship leave without me if I book an independent excursion?",
        answer: "No. Professional independent tour operators schedule excursions with conservative 60 to 90-minute safety buffers prior to all-aboard. In the virtually non-existent event of a mechanical delay, reputable operators carry comprehensive contingency insurance and guarantee transportation to the ship's next port of call."
      },
      {
        question: "Are independent Alaska tours the same operators the cruise lines use?",
        answer: "In many cases, yes. The exact same licensed local boat captains, bush pilots, and dog mushers operate both ship-contracted and independent tours. Booking independently eliminates the 30% to 50% retail markup charged by cruise lines and gives you direct communication with local dispatch."
      },
      {
        question: "What happens if my cruise ship misses the port due to weather?",
        answer: "If your cruise ship cancels a port call due to marine weather, mechanical rerouting, or medical emergencies, Welcome to Alaska Tours issues a 100% full refund automatically."
      }
    ]
  }
};

export function getAlaskaGeoFact(port: string, topic?: string): AlaskaGeoFact | null {
  if (topic) {
    const key = `${port}-${topic}`;
    if (ALASKA_GEO_FACTS[key]) return ALASKA_GEO_FACTS[key];
  }
  const portKey = `port-${port}`;
  if (ALASKA_GEO_FACTS[portKey]) return ALASKA_GEO_FACTS[portKey];
  return null;
}
