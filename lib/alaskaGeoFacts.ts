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
      "Juneau whale watching excursions typically cost $165 to $195 per person for small-to-midsize passenger boats, or $245 to $295 for Whale Watching + Mendenhall Glacier combo tours (5 to 5.5 hours total). Tours last approximately 3 to 3.5 hours total (including 2 to 2.5 hours on the water in Auke Bay). Local independent operators provide round-trip transfers from the downtown Juneau cruise ship terminal (Mt. Roberts Tram plaza) and guarantee on-time return to your ship well ahead of all-aboard.",
    pricingLabel: "Starting Rate",
    pricingValue: "$165–$195 / person standalone • $245–$295 with Mendenhall combo",
    durationLabel: "Duration & Water Time",
    durationValue: "~3.5 hours standalone (2–2.5h on water) • 5–5.5h combo",
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
        answer: "Yes. Combination excursions package both into a 5 to 5.5-hour coordinated itinerary, with 2.5 hours on the water and 1.5 to 2 hours at Mendenhall Glacier Recreation Area, departing and returning directly to the downtown cruise docks."
      },
      {
        question: "What is included in a Juneau whale watching excursion?",
        answer: "Tours include round-trip motorcoach/van transportation between the cruise docks and Auke Bay marina, a covered heated catamaran with outdoor viewing decks, a naturalist guide, binoculars, complimentary light snacks and hot drinks, and USFS entrance permits on combination tours."
      }
    ]
  },
  "juneau-whale-watching-vs-mendenhall": {
    id: "juneau-whale-watching-vs-mendenhall",
    port: "juneau",
    topic: "whale-watching-vs-mendenhall",
    directQuestion: "Should I choose whale watching, Mendenhall Glacier, or a combination tour in Juneau?",
    directAnswer:
      "If you have a port call of 6+ hours, book a combined Whale Watching & Mendenhall Glacier excursion ($245–$295, 5–5.5 hours total) to experience both without coordinating separate transit. For shorter port windows (4–5 hours), choose a single focused activity: 3.5-hour Auke Bay whale watching ($165–$195) for guaranteed humpback sightings, or a 2.5–3 hour Mendenhall Glacier shuttle/tour ($45–$95) for walking to Nugget Falls and scenic photo points.",
    pricingLabel: "Decision Pricing",
    pricingValue: "$165–$195 Whales • $45–$95 Mendenhall • $245–$295 Combo Tour",
    durationLabel: "Port Time Required",
    durationValue: "Combo: 5–5.5h (requires 6.5h+ port call) • Single: 2.5–3.5h",
    meetingPointLabel: "Cruise Dock Departure",
    meetingPointValue: "Mt. Roberts Tramway Plaza (Downtown Juneau cruise terminal)",
    safetyBufferLabel: "All-Aboard Protection",
    safetyBufferValue: "Enforces tour end time + 45 min <= ship all-aboard formula",
    faqSchema: [
      {
        question: "Is it better to book whale watching and Mendenhall Glacier together or separately?",
        answer: "Booking a combined tour with one operator is significantly smoother because transportation between the cruise dock, Auke Bay marina, and Mendenhall Glacier is pre-coordinated, saving 45 minutes of transfer friction and guaranteeing USFS recreation area access."
      },
      {
        question: "What happens if our ship arrives late in Juneau?",
        answer: "Local operators monitor ship docking in real time. If your vessel arrives late, tour departure times are adjusted automatically, or you will be placed on the next available departure with full on-time return protection."
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
      "Ketchikan offers rugged temperate rainforest adventures including the famous Adventure Kart Expedition ($195–$250) driving custom Tomcar off-road vehicles through Whipple Creek mountain trails, sea kayaking at Clover Pass with Ketchikan Kayak Co ($145–$185), canopy ziplining over old-growth cedar trees ($160–$199), and cold-water wilderness snorkeling in Mountain Point ($150–$175). All active excursions include commercial transport from the cruise docks, heavy-duty raingear, and professional local guides.",
    pricingLabel: "Adventure Rates",
    pricingValue: "$145–$250 / person (Kart, Kayak, Zipline, Snorkel)",
    durationLabel: "Tour Time",
    durationValue: "3–4 hours dock-to-dock",
    meetingPointLabel: "Pier Meeting Point",
    meetingPointValue: "Ketchikan Cruise Ship Terminal Berth 1–4 pickup zone (Ward Cove shuttle compatible)",
    safetyBufferLabel: "Cruise Buffer",
    safetyBufferValue: "Guaranteed ship return cushion of at least 60–90 minutes",
    faqSchema: [
      {
        question: "What is the Ketchikan Adventure Kart Expedition?",
        answer: "The Adventure Kart Expedition is a guided off-road adventure where guests drive 2-person rough-terrain Tomcar utility vehicles along rugged rainforest logging trails, climbing sub-alpine mountain tracks with scenic viewpoints overlooking the Tongass Narrows."
      },
      {
        question: "Do you need a driver's license for Ketchikan adventure kart tours?",
        answer: "Yes. Drivers must present a valid government-issued driver's license (minimum age typically 16 or 18 with adult passenger). Passengers can ride along with licensed drivers."
      }
    ]
  },

  // Skagway Core Topics
  "skagway-helicopter-tours": {
    id: "skagway-helicopter-tours",
    port: "skagway",
    topic: "helicopter-tours",
    directQuestion: "How do Skagway helicopter glacier tours compare to Juneau?",
    directAnswer:
      "Skagway helicopter tours (operated by certified air carriers like TEMSCO Air Skagway) fly over the jagged Sawtooth Ridge and dramatic Chilkat Glacier system, costing $350 to $410 per person for an icefield flight with glacier landing. Skagway flights are often less crowded than Juneau and can include guided walking or glacier dog sledding. Flights meet right near the Skagway cruise docks and feature full weather refund guarantees.",
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
    directQuestion: "What active scooter and wilderness shore excursions are available in Skagway?",
    directAnswer:
      "Active excursions in Skagway include the Skagway Scooters Gold Rush Adventure and electric scooter rentals ($110–$150) exploring the coastal Dyea Road and Klondike trails, guided White Pass bicycle descents, Taiya River raft floats on the Chilkoot Trail ($145–$185), and alpine rock climbing. Scooter and active tours meet on 2nd Ave or near the cruise docks (5–10 min walk) and provide helmets, raingear, and orientation.",
    pricingLabel: "Active Excursion Rates",
    pricingValue: "$110–$150 Scooters • $145–$185 Raft/Hike • $350–$410 Glacier Heli",
    durationLabel: "Duration",
    durationValue: "2.5 to 4 hours total",
    meetingPointLabel: "Skagway Staging",
    meetingPointValue: "2nd Avenue & Broadway (short 5–10 min walk from cruise docks)",
    safetyBufferLabel: "Ship Cushion",
    safetyBufferValue: "Guaranteed on-time return well before ship all-aboard",
    faqSchema: [
      {
        question: "How do Skagway scooter tours work for cruise ship passengers?",
        answer: "Skagway scooter excursions depart from downtown 2nd Avenue, just a short 5-minute walk from the cruise ship docks. Riders explore historic Broadway, scenic coastal viewpoints along Dyea Road, and Gold Rush landmarks on easy-to-ride electric or motorized scooters."
      },
      {
        question: "Is a driver's license required for Skagway scooter rentals and tours?",
        answer: "Yes. All scooter operators must possess and present a valid government-issued driver's license (must be 18+ or 16+ depending on model). Safety helmets and operating tutorials are included."
      }
    ]
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

  // Juneau Expanded Topics
  "juneau-glacier-tours": {
    id: "juneau-glacier-tours",
    port: "juneau",
    topic: "glacier-tours",
    directQuestion: "What kinds of glacier tours can cruise passengers do in Juneau?",
    directAnswer:
      "Juneau offers four distinct glacier experiences: scenic viewing from Mendenhall Visitor Center ($45–$95), guided glacier canoe and kayak paddles on Mendenhall Lake ($195–$245), helicopter scenic flights with a 25-minute glacier ice landing ($360–$420), and advanced guided ice treks or ice climbing on the Juneau Icefield ($550–$695). All tours include round-trip dock transfers and timing coordinated with ship port calls.",
    pricingLabel: "Glacier Tour Rates",
    pricingValue: "$45–$95 viewing • $195–$245 lake paddle • $360–$695 helicopter / trek",
    durationLabel: "Duration Window",
    durationValue: "2.5 to 5 hours depending on activity format",
    meetingPointLabel: "Cruise Dock Pickup",
    meetingPointValue: "Mt. Roberts Tramway Plaza / Cruise ship terminal shuttle bus loop",
    safetyBufferLabel: "Return Protection",
    safetyBufferValue: "Conservative return 60–90 min prior to all-aboard",
    faqSchema: [
      {
        question: "How close can you get to Mendenhall Glacier on foot?",
        answer: "From the Visitor Center trail system, the Nugget Falls trail brings you within about 0.75 miles of the glacier terminus across an iceberg-dotted lake. Walking directly on the ice requires a guided ice trek accessed by helicopter or guided lake paddle."
      },
      {
        question: "Do glacier tours run if it rains in Juneau?",
        answer: "Yes. Rain is common in the Tongass National Forest temperate rainforest, and glaciers often appear more vividly blue under overcast skies. Boat and ground tours run rain or shine with supplied raingear; helicopter flights operate unless mountain cloud ceilings drop below FAA safety minimums."
      }
    ]
  },
  "juneau-easy-shore-excursions": {
    id: "juneau-easy-shore-excursions",
    port: "juneau",
    topic: "easy-shore-excursions",
    directQuestion: "What are the best low-walking, easy shore excursions in Juneau?",
    directAnswer:
      "For older travelers, multigenerational families, or visitors with limited mobility, Juneau's top easy excursions include covered catamaran whale watching with enclosed heated cabins ($165–$185), the historic Gold Creek salmon bake and mining camp ($75–$95), the Mt. Roberts Tramway right at the dock ($55), and scenic coach drives to Mendenhall Glacier Visitor Center ($45–$65). All feature minimal walking and ramp or low-step coach boarding.",
    pricingLabel: "Accessible Rates",
    pricingValue: "$45–$185 / person across scenic options",
    durationLabel: "Duration",
    durationValue: "2 to 3.5 hours total (Relaxed pacing)",
    meetingPointLabel: "Pier Meeting Point",
    meetingPointValue: "Direct dockside pickup at downtown Juneau piers",
    safetyBufferLabel: "Ship Return Buffer",
    safetyBufferValue: "Downtown proximity ensures 60+ min safety cushion",
    faqSchema: [
      {
        question: "Can someone with limited mobility see Mendenhall Glacier?",
        answer: "Yes. The Mendenhall Visitor Center facility has accessible ramps, paved paths, and wide viewing windows overlooking the glacier and lake without requiring trail walking."
      },
      {
        question: "Are Juneau whale watching boats wheelchair accessible?",
        answer: "Many commercial catamarans accommodate folding wheelchairs and provide step-free boarding ramps. Operators should be notified at booking to ensure appropriate vessel assignment."
      }
    ]
  },
  "juneau-private-tours": {
    id: "juneau-private-tours",
    port: "juneau",
    topic: "private-tours",
    directQuestion: "Can you book private shore excursions in Juneau for your family or group?",
    directAnswer:
      "Yes. Private Juneau excursions include private 6-pack whale-watching boats ($1,400–$1,800 for up to 6 guests), private salmon and halibut fishing charters ($1,200–$1,800), private luxury passenger vans for custom Mendenhall and island tours ($850–$1,200), and exclusive helicopter charters. Private bookings let your group set the exact schedule, pacing, and focus while ensuring dedicated return to the ship.",
    pricingLabel: "Private Charter Rates",
    pricingValue: "$850–$1,800 per private boat / van charter",
    durationLabel: "Custom Duration",
    durationValue: "3 to 6 hours (Customizable timing)",
    meetingPointLabel: "Personalized Pickup",
    meetingPointValue: "Personalized curbside greeting at your specific cruise berth",
    safetyBufferLabel: "Dedicated Return",
    safetyBufferValue: "Dedicated private vehicle guarantees custom on-time ship return",
    faqSchema: [
      {
        question: "Why choose a private whale watching charter in Juneau?",
        answer: "A private boat gives your family full 360-degree viewing rails with zero crowds, customizable hydrophone listening time, and flexible departure times that align perfectly with your ship's disembarkation."
      }
    ]
  },

  // Ketchikan Expanded Topics
  "ketchikan-wildlife-tours": {
    id: "ketchikan-wildlife-tours",
    port: "ketchikan",
    topic: "wildlife-tours",
    directQuestion: "What wildlife can you see on a Ketchikan shore excursion?",
    directAnswer:
      "Ketchikan is surrounded by the Tongass National Forest and protected coastal channels, making it one of Alaska's best ports for viewing wild bald eagles, coastal black bears, humpback whales, orcas, harbor seals, Steller sea lions, and river otters. Excursions include rainforest wildlife sanctuaries ($110–$150), wildlife and zodiac boat safaris ($165–$215), and fly-in bear viewing ($495–$650).",
    pricingLabel: "Wildlife Pricing",
    pricingValue: "$110–$215 local wildlife • $495–$650 remote fly-in",
    durationLabel: "Tour Duration",
    durationValue: "2.5 to 4.5 hours total",
    meetingPointLabel: "Berth Pickup",
    meetingPointValue: "Ketchikan Visitors Bureau (Berth 2) or direct Berth 1–4 gangway",
    safetyBufferLabel: "Cruise Buffer",
    safetyBufferValue: "Tours finish with 60–90 min buffer before all-aboard",
    faqSchema: [
      {
        question: "Where can you see bald eagles in Ketchikan?",
        answer: "Ketchikan has one of the highest concentrations of bald eagles in North America. Eagles are easily spotted nesting along the waterfront, circling canneries near Ward Cove, and roosting in the tall hemlocks of the Alaska Rainforest Sanctuary."
      }
    ]
  },
  "ketchikan-easy-shore-excursions": {
    id: "ketchikan-easy-shore-excursions",
    port: "ketchikan",
    topic: "easy-shore-excursions",
    directQuestion: "What are the best easy, low-walking shore excursions in Ketchikan?",
    directAnswer:
      "Top low-stress Ketchikan excursions include the amphibious Ketchikan Duck Tour ($65–$85) traversing historic downtown and harbor waters, the Ketchikan Historic Town & Saxman Native Village cultural bus tour ($75–$95), and covered harbor wildlife catamarans ($145–$175). For dockside exploring, historic Creek Street, Married Man's Trail, and the Southeast Alaska Discovery Center are all within a 3 to 10-minute flat walk of Berths 1–4.",
    pricingLabel: "Tour Rates",
    pricingValue: "$65–$95 city & culture • $145–$175 covered catamaran",
    durationLabel: "Duration",
    durationValue: "1.5 to 3 hours (Gentle, low-impact pacing)",
    meetingPointLabel: "Cruise Berth Pickup",
    meetingPointValue: "Direct Berth 1–4 dockside pickup (Ward Cove shuttle compatible)",
    safetyBufferLabel: "Return Margin",
    safetyBufferValue: "Low-mileage footprint provides safe 60+ min return margin",
    faqSchema: [
      {
        question: "Is Creek Street accessible for strollers and wheelchairs?",
        answer: "Yes. The boardwalk along Creek Street is wooden and flat, though rain can make the wood slick and some historic shop entrances have single steps."
      }
    ]
  },
  "ketchikan-private-tours": {
    id: "ketchikan-private-tours",
    port: "ketchikan",
    topic: "private-tours",
    directQuestion: "Are private shore excursions available in Ketchikan?",
    directAnswer:
      "Yes. Private options in Ketchikan include customized luxury Hummer excursions ($750–$950 for up to 5 guests) exploring rainforest coastlines, private wildlife and fishing charters ($1,100–$1,600), and private Misty Fjords floatplane charters ($1,800–$2,400). Private tours offer personalized pickup, customizable stops at totem parks or waterfalls, and dedicated return timing.",
    pricingLabel: "Private Pricing",
    pricingValue: "$750–$2,400 per private group / vessel",
    durationLabel: "Tour Length",
    durationValue: "3 to 5 hours (Tailored to your port window)",
    meetingPointLabel: "Pier Greeting",
    meetingPointValue: "Exclusive berth-side pickup directly at your ship gangway",
    safetyBufferLabel: "Return Guarantee",
    safetyBufferValue: "Dedicated private driver guarantees on-time return to ship"
  },

  // Skagway Expanded Topics
  "skagway-easy-shore-excursions": {
    id: "skagway-easy-shore-excursions",
    port: "skagway",
    topic: "easy-shore-excursions",
    directQuestion: "What easy shore excursions are available in Skagway for seniors and families?",
    directAnswer:
      "Skagway's flat, compact layout makes it exceptionally accessible. Top easy excursions include the Liarsville Gold Rush Trail Camp and salmon bake ($65–$95) featuring seated gold panning and melodrama performances, historic town and scenic White Pass overlook tours by comfortable minibus ($60–$85), and exploring the Klondike Gold Rush National Historical Park boardwalks right from the piers with no steep hills.",
    pricingLabel: "Easy Excursion Rates",
    pricingValue: "$60–$95 / person across historic and scenic options",
    durationLabel: "Duration",
    durationValue: "2 to 3 hours (Fully accessible / seated formats)",
    meetingPointLabel: "Staging Area",
    meetingPointValue: "Small Boat Harbor parking or Broadway & 2nd Ave pickup",
    safetyBufferLabel: "All-Aboard Cushion",
    safetyBufferValue: "Skagway's small footprint guarantees 60+ min return cushion",
    faqSchema: [
      {
        question: "How far is downtown Skagway from the cruise docks?",
        answer: "Downtown Skagway starts just 0.25 to 0.5 miles from the Ore and Broadway docks (a 5 to 10-minute flat walk). From Railroad Dock, a municipal shuttle or transfer train transports guests right into town."
      }
    ]
  },
  "skagway-private-tours": {
    id: "skagway-private-tours",
    port: "skagway",
    topic: "private-tours",
    directQuestion: "Can you book a private tour in Skagway?",
    directAnswer:
      "Yes. Private shore excursions in Skagway include private guided vans and minibuses traveling the Klondike Highway to the Yukon border and emerald lakes ($850–$1,300 for up to 10 guests), private gold panning and history outings, and custom scooter tours. Private departures avoid bus crowds and adapt seamlessly to your ship's arrival and all-aboard times.",
    pricingLabel: "Charter Rates",
    pricingValue: "$850–$1,300 private van / coach charter",
    durationLabel: "Custom Timing",
    durationValue: "3 to 6 hours (Custom pacing)",
    meetingPointLabel: "Dockside Pier Greeting",
    meetingPointValue: "Direct dockside pier greeting at Ore, Broadway, or Railroad Dock",
    safetyBufferLabel: "Return Protection",
    safetyBufferValue: "Customized dispatch with direct contact to local ship agents"
  },

  // Authority Question Guides
  "best-shore-excursions-in-juneau": {
    id: "best-shore-excursions-in-juneau",
    port: "juneau",
    directQuestion: "What are the best shore excursions in Juneau for cruise passengers?",
    directAnswer:
      "The undisputed top two shore excursions in Juneau are small-boat humpback whale watching in Auke Bay ($165–$195) and visiting Mendenhall Glacier ($45–$95). For bucket-list splurges, helicopter glacier landings ($360–$420) and glacier dog sledding ($650–$799) are unmatched. Active travelers favor guided Mendenhall Lake canoe paddles ($215) and salmon fishing charters ($295+).",
    pricingLabel: "Pricing Spectrum",
    pricingValue: "$45–$95 (Glacier shuttle) • $165–$195 (Whales) • $360–$799 (Helicopter)",
    durationLabel: "Excursion Times",
    durationValue: "3 to 5.5 hours per excursion",
    meetingPointLabel: "Central Hub",
    meetingPointValue: "Mt. Roberts Tramway Plaza (Downtown Juneau cruise terminal)",
    safetyBufferLabel: "Cruise Coordination",
    safetyBufferValue: "All departures coordinated with 60–90 min return cushion",
    faqSchema: [
      {
        question: "Can I do two tours in one Juneau port day?",
        answer: "Yes, if your port call is 8 hours or longer. The most popular combination is a morning whale watching tour (8:30 AM–12:00 PM) followed by an afternoon Mendenhall Glacier visit (1:00 PM–4:30 PM)."
      }
    ]
  },
  "how-to-get-to-mendenhall-glacier-from-cruise-port": {
    id: "how-to-get-to-mendenhall-glacier-from-cruise-port",
    port: "juneau",
    directQuestion: "How do I get to Mendenhall Glacier from the cruise port without getting stranded?",
    directAnswer:
      "Mendenhall Glacier is 13 miles northwest of the downtown Juneau cruise docks. The most reliable method is an authorized commercial tour shuttle or combination excursion ($45–$95) booked in advance. Taxis and Ubers are scarce during peak port hours and may not be available for the return trip, while city buses drop passengers 1.5 miles from the visitor center along a gravel road. Commercial permits are strictly capped by the US Forest Service.",
    pricingLabel: "Transport Cost",
    pricingValue: "$45–$95 round-trip commercial transport & USFS permit",
    durationLabel: "Travel & Tour",
    durationValue: "25-minute drive each way • 2 to 3 hours total on site",
    meetingPointLabel: "Shuttle Station",
    meetingPointValue: "Downtown Juneau Tram Parking Lot commercial shuttle bays",
    safetyBufferLabel: "Return Guarantee",
    safetyBufferValue: "Pre-scheduled return shuttle guarantees arrival 60+ min before all-aboard",
    faqSchema: [
      {
        question: "Can I take an Uber or Lyft to Mendenhall Glacier?",
        answer: "Rideshares can drop off at Mendenhall, but cell service is spotty at the glacier and ride requests for the return trip frequently fail due to severe driver shortages in Juneau. An organized tour with guaranteed return transport is strongly recommended."
      }
    ]
  },
  "best-things-to-do-in-skagway-4-6-hours": {
    id: "best-things-to-do-in-skagway-4-6-hours",
    port: "skagway",
    directQuestion: "What are the best things to do in Skagway if I only have 4 to 6 hours?",
    directAnswer:
      "With a short 4 to 6-hour port window in Skagway, prioritize high-efficiency experiences close to port: a 2.5-hour helicopter glacier landing over Sawtooth Ridge ($350–$410), a 2.5-hour Liarsville Gold Rush camp and salmon bake ($75–$95), a 3-hour electric scooter tour to Dyea ($120–$150), or walking the historic 7-block Broadway National Historic District. Avoid long 7-hour Yukon train expeditions that risk cutting into tight all-aboard times.",
    pricingLabel: "Short-Day Rates",
    pricingValue: "$65–$95 culture • $120–$160 active • $350–$410 helicopter",
    durationLabel: "Time Commitment",
    durationValue: "2 to 3.5 hours (Leaves comfortable 60–90 min return cushion)",
    meetingPointLabel: "Pier Location",
    meetingPointValue: "Broadway Dock / Ore Dock / Railroad Dock gangways",
    safetyBufferLabel: "Cruise Buffer Rule",
    safetyBufferValue: "Strictly preserves 45-minute minimum buffer before all-aboard",
    faqSchema: [
      {
        question: "Is the White Pass railway worth it for short port calls?",
        answer: "The 2.5-hour White Pass Summit Excursion fits a 5+ hour port call comfortably. However, if your port stay is under 5 hours, local town and glacier helicopter tours provide lower timing stress."
      }
    ]
  },
  "first-time-in-ketchikan-shore-excursions": {
    id: "first-time-in-ketchikan-shore-excursions",
    port: "ketchikan",
    directQuestion: "What should a first-timer do on a cruise stop in Ketchikan?",
    directAnswer:
      "First-time visitors to Ketchikan should choose between three signature experiences: a floatplane flightseeing tour over Misty Fjords National Monument ($330–$395), a guided rainforest wildlife and bear-viewing tour at Herring Cove ($120–$180), or sea kayaking along the Tongass coastline ($145–$185). Pair your tour with an hour strolling historic Creek Street, Dolly's House, and seeing the world's largest collection of standing totem poles.",
    pricingLabel: "Introductory Rates",
    pricingValue: "$65–$95 historic town • $120–$185 wildlife/kayak • $330–$395 Misty Fjords",
    durationLabel: "Experience Time",
    durationValue: "2.5 to 4 hours total",
    meetingPointLabel: "Meeting Point",
    meetingPointValue: "Ketchikan Visitors Bureau (Berth 2) or downtown gangway",
    safetyBufferLabel: "Port Buffer",
    safetyBufferValue: "Ward Cove ships require 90-min return cushion; Downtown berths 45–60 min",
    faqSchema: [
      {
        question: "Does it always rain in Ketchikan?",
        answer: "Ketchikan receives over 150 inches of rain annually. Local operators provide heavy-duty rain poncho gear; tours operate routinely and safely in coastal drizzle."
      }
    ]
  },
  "how-much-do-alaska-shore-excursions-cost": {
    id: "how-much-do-alaska-shore-excursions-cost",
    port: "all",
    directQuestion: "How much do Alaska cruise shore excursions cost on average?",
    directAnswer:
      "Alaska shore excursion prices range by activity type: walking tours and gold panning cost $65 to $110; whale watching costs $165 to $195; sea kayaking and active adventures cost $145 to $220; salmon and halibut fishing charters cost $295 to $375; Misty Fjords floatplanes cost $330 to $395; helicopter glacier landings cost $360 to $420; and glacier dog sledding costs $650 to $799. Booking independently saves 20% to 40% compared to cruise ship onboard pricing.",
    pricingLabel: "Verified Price Ranges",
    pricingValue: "$65–$110 walking/history • $165–$220 wildlife/water • $330–$799 flight/ice",
    durationLabel: "Duration Range",
    durationValue: "2 to 6 hours depending on tour category",
    meetingPointLabel: "Port Staging",
    meetingPointValue: "Direct port dock pickups across Juneau, Skagway, and Ketchikan",
    safetyBufferLabel: "Value & Safety",
    safetyBufferValue: "Independent tours include back-to-ship guarantees and clear buffers",
    faqSchema: [
      {
        question: "Why are Alaska shore excursions more expensive than Caribbean tours?",
        answer: "Alaska operations have a short 4-month operating season, strict federal USFS/FAA safety certifications, highly maintained aircraft and twin-engine marine vessels, and licensed master captains and bush pilots."
      }
    ]
  },
  "what-happens-if-my-alaska-tour-runs-late": {
    id: "what-happens-if-my-alaska-tour-runs-late",
    port: "all",
    directQuestion: "What happens if an independent Alaska shore excursion runs late?",
    directAnswer:
      "Professional independent operators enforce a strict safety rule: all tours must return at least 45 to 60 minutes before your ship's published all-aboard time. Because Juneau, Skagway, and Ketchikan have compact road networks with single main corridors, traffic jams are practically non-existent. In the rare event of a mechanical delay, operators communicate directly with harbor pilots and port agents, deploy backup transport, and carry comprehensive back-to-ship guarantees.",
    pricingLabel: "Protection Level",
    pricingValue: "100% Back-to-Ship Guarantee • Fully insured local operators",
    durationLabel: "Return Rule",
    durationValue: "Tour end time + 45 min return buffer strictly <= ship all-aboard",
    meetingPointLabel: "Real-Time Tracking",
    meetingPointValue: "Port dispatchers monitor ship movements and berthing in real time",
    safetyBufferLabel: "Safety Buffer Rule",
    safetyBufferValue: "Mandatory 45–60 min minimum buffer enforced on every booking",
    faqSchema: [
      {
        question: "Has an independent tour operator ever caused a guest to miss an Alaska cruise ship?",
        answer: "Missed departures are virtually non-existent with established operators. Welcome to Alaska Tours partners have a 100% on-time record over thousands of passenger departures."
      }
    ]
  },
  "easy-alaska-shore-excursions": {
    id: "easy-alaska-shore-excursions",
    port: "all",
    directQuestion: "What are the best easy Alaska shore excursions for seniors and limited mobility?",
    directAnswer:
      "The most comfortable low-mobility Alaska excursions feature enclosed seating, minimal walking, and step-free or low-step vehicle access: Juneau covered catamaran whale watching ($165–$185), the historic Gold Creek salmon bake ($75–$95), the Skagway Liarsville camp melodrama and gold panning ($65–$95), Ketchikan Duck amphibious tours ($65–$85), and scenic floatplane flights over Misty Fjords ($330–$395). Wheelchair-friendly options can be arranged in advance.",
    pricingLabel: "Accessible Pricing",
    pricingValue: "$65–$95 city & culture • $165–$195 covered boat • $330–$395 floatplane",
    durationLabel: "Gentle Timing",
    durationValue: "1.5 to 3.5 hours (Gentle, low-impact pacing)",
    meetingPointLabel: "Pier Curbside",
    meetingPointValue: "Direct cruise berth curbside pickups across all three ports",
    safetyBufferLabel: "Low-Stress Cushion",
    safetyBufferValue: "Relaxed transit buffers ensure low-stress return to ship",
    faqSchema: [
      {
        question: "Can mobility scooters be accommodated on Alaska excursions?",
        answer: "Collapsible mobility scooters can be stowed in the luggage compartments of excursion vans and motorcoaches. Notify the operator at booking to confirm storage dimensions."
      }
    ]
  },
  "private-premium-alaska-shore-excursions": {
    id: "private-premium-alaska-shore-excursions",
    port: "all",
    directQuestion: "What luxury and private shore excursions are available in Alaska?",
    directAnswer:
      "For guests seeking exclusive luxury and VIP privacy, top private Alaska excursions include private 6-pack whale watching yachts in Juneau ($1,400–$1,800), private helicopter icefield expeditions with champagne glacier landings ($2,200–$3,500), private Misty Fjords seaplane charters in Ketchikan ($1,800–$2,400), private Ketchikan luxury Hummer rainforest tours ($750–$950), and private salmon/halibut charters ($1,200–$1,800).",
    pricingLabel: "Luxury Charters",
    pricingValue: "$750–$3,500 per private vessel / aircraft / vehicle",
    durationLabel: "Custom Itinerary",
    durationValue: "3 to 6 hours (Completely customized to your schedule)",
    meetingPointLabel: "VIP Dock Greeting",
    meetingPointValue: "VIP greeting directly at the ship gangway",
    safetyBufferLabel: "Dedicated Safety",
    safetyBufferValue: "Dedicated private transportation guarantees custom on-time ship return",
    faqSchema: [
      {
        question: "Can private Alaska tours be tailored for multi-generational families?",
        answer: "Yes. Private charters are the premier option for multi-generational groups with toddlers and grandparents, allowing you to stop whenever needed, alter routes, and maintain comfortable cabin temperatures."
      }
    ]
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
  },

  // Bird Watching Guide
  "best-alaska-cruise-ports-for-bird-watching": {
    id: "best-alaska-cruise-ports-for-bird-watching",
    port: "all",
    topic: "bird-watching",
    directQuestion: "What are the best Alaska cruise ports for bird watching and how can passengers spot species near the docks?",
    directAnswer:
      "Top Alaska cruise ports for bird watching include Juneau (Mendenhall Wetlands & Auke Bay waters), Ketchikan (Clover Pass & Ward Lake in the Tongass National Forest), and Skagway (Taiya River estuary & Yakutania Point). Cruise passengers can observe Bald Eagles, Marbled Murrelets, Pigeon Guillemots, Rufous Hummingbirds, and pelagic seabirds via short independent coastal walks from port (15–45 min) or by booking sea kayaking and whale watching boat excursions that navigate active shoreline feeding zones.",
    pricingLabel: "Cost & Access",
    pricingValue: "Free independent walks • $125–$195 Sea Kayak / Wildlife excursions",
    durationLabel: "Time Required",
    durationValue: "1–2 hours independent coastal walks • 3–4 hours boat/kayak excursions",
    meetingPointLabel: "Port Proximity",
    meetingPointValue: "Yakutania Point (walk from Skagway dock) • Tram / Berth shuttles for Juneau & Ketchikan",
    safetyBufferLabel: "Viewing Ethics",
    safetyBufferValue: "Maintain 100+ yard eagle buffer • Use binoculars/telephoto • Respect nesting zones",
    faqSchema: [
      {
        question: "Can you see bald eagles directly from Alaska cruise ports?",
        answer: "Yes. Bald eagles are ubiquitous across Southeast Alaska cruise ports. In Ketchikan and Juneau, dozens of bald eagles regularly perch on harbor pilings, cannery roofs, and shoreline spruce trees within sight of the cruise ship docks."
      },
      {
        question: "Where is the best place to spot seabirds like puffins or murrelets on an Alaska cruise?",
        answer: "Marbled Murrelets and Pigeon Guillemots are frequently seen feeding in coastal waters during whale watching catamaran trips in Juneau (Auke Bay) and sea kayaking tours in Ketchikan (Clover Pass). For Tufted and Horned Puffins, pelagic excursions near Sitka Sound or Kenai Fjords offer the highest concentration."
      },
      {
        question: "Are there dedicated bird-watching shore excursions in Alaska?",
        answer: "While standalone commercial birding tours are rare in cruise ports, booking a small-boat whale watching charter, a guided sea kayaking tour, or a rainforest nature walk provides exceptional naturalist guidance and puts you directly in prime coastal and marine bird habitats."
      }
    ]
  },

  // Alaska Nature by Cruise Port Master Guide
  "alaska-nature-by-cruise-port": {
    id: "alaska-nature-by-cruise-port",
    port: "all",
    topic: "nature",
    directQuestion: "What wildlife, northern lights, and whale watching can cruise passengers realistically experience in Southeast Alaska ports?",
    directAnswer:
      "Across Southeast Alaska cruise ports, Juneau and Icy Strait Point offer the highest seasonal opportunity for humpback whale watching from May through September via dedicated catamaran boat excursions. Ketchikan features North America's densest bald eagle nesting corridors and rainforest wildlife. Northern lights require true night darkness and clear skies, making them seasonally possible only from late August through September on open ship decks at sea (May–July has 18–22 hours of daylight). Sightings and aurora displays depend on solar activity, tides, and weather and are never guaranteed.",
    pricingLabel: "Nature Excursions",
    pricingValue: "Free pier walks • $145–$195 Whale/Wildlife boats & Kayak tours",
    durationLabel: "Time Commitment",
    durationValue: "1–2 hours independent walks • 3–4.5 hours marine wildlife tours",
    meetingPointLabel: "Port Meeting Points",
    meetingPointValue: "Curbside at cruise terminals / Pier walking paths (Yakutania, Ward Lake, Tram)",
    safetyBufferLabel: "Cruise Buffer & Guarantees",
    safetyBufferValue: "All excursions enforce 45–60+ min return buffer before all-aboard",
    faqSchema: [
      {
        question: "Can you see the northern lights on a summer Alaska cruise?",
        answer: "During peak cruise season (May through July), the aurora borealis is virtually invisible due to 18 to 22 hours of daily sunlight and continuous twilight. Northern lights visibility is only realistically possible on late-season sailings from late August through September when true night darkness returns."
      },
      {
        question: "Which Alaska cruise port is best for whale watching?",
        answer: "Juneau and Icy Strait Point (Hoonah) offer the highest seasonal probability for humpback whale viewing. Nutrient-rich waters around Auke Bay, Favorite Channel, and Point Adolphus host active feeding groups from May through September."
      },
      {
        question: "Are wildlife sightings guaranteed on Alaska shore excursions?",
        answer: "While reputable Juneau boat operators offer 100% sighting guarantees for humpback whales during the May–September season due to consistent feeding grounds, wild animal behavior in open marine habitats is never completely predictable. Northern lights and specific animal encounters cannot be guaranteed."
      }
    ]
  }
};

export function getAlaskaGeoFact(port: string, topic?: string): AlaskaGeoFact | null {
  if (topic) {
    const key = `${port}-${topic}`;
    if (ALASKA_GEO_FACTS[key]) return ALASKA_GEO_FACTS[key];
    if (ALASKA_GEO_FACTS[topic]) return ALASKA_GEO_FACTS[topic];
  }
  if (ALASKA_GEO_FACTS[port]) return ALASKA_GEO_FACTS[port];
  const portKey = `port-${port}`;
  if (ALASKA_GEO_FACTS[portKey]) return ALASKA_GEO_FACTS[portKey];
  return null;
}

