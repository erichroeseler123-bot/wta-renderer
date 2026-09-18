import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHelicopterToursSnapshot, type HelicopterTour } from "@/lib/helicopterTours";
import { sanitizeTours } from "@/lib/tourSeo";
import GeoDirectAnswerCard from "@/components/seo/GeoDirectAnswerCard";
import { getAlaskaGeoFact } from "@/lib/alaskaGeoFacts";

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
  {
    port: "juneau",
    topic: "whale-watching",
    title: "Juneau Whale Watching Tours: Mendenhall Combos & Small Boats (2026)",
    h1: "Juneau whale watching tours & glacier combos",
    description: "Compare Juneau whale watching excursions and Mendenhall Glacier combos. Guaranteed sightings, heated catamarans, Auke Bay departures, and cruise ship buffers.",
    intro: "Juneau is world-renowned for humpback whale watching in Auke Bay and Favorite Channel. Compare small-boat wilderness excursions (12–24 guests), covered heated catamarans with outdoor viewing decks, and convenient 5 to 5.5-hour Whale Watching + Mendenhall Glacier combination tours departing directly from the downtown cruise ship terminal.",
    chooserTopic: "wildlife-whales",
    keywords: ["whale", "lighthouse", "auke bay"],
    eyebrow: "100% Whale Sighting Guarantee · May to September",
    decisionTitle: "Choose the right Juneau whale watching format",
    decisionIntro: "Start with your group's desired boat size, port schedule, and whether you want to combine whale watching with Mendenhall Glacier.",
    decisionPoints: [
      { title: "Whale watching + Mendenhall combo", text: "The most popular cruise excursion (5–5.5 hours). Combines 2.5h on the water with 1.5–2h at Mendenhall Glacier with all transit and USFS passes included." },
      { title: "Small-boat wildlife charters", text: "12 to 24-passenger vessels offering lower water-level views, 360-degree photography decks, and hydrophones to listen to whale vocalizations." },
      { title: "Covered heated catamarans", text: "Ideal for all weather conditions and multigenerational families, featuring heated indoor cabins, panoramic windows, and wide outdoor viewing decks." },
    ],
    faqs: [
      { question: "Are whale sightings guaranteed in Juneau?", answer: "Yes. Reputable Juneau operators offer a 100% whale sighting guarantee from May through September. Humpback whales reliably migrate to Auke Bay's nutrient-rich waters to feed on herring and krill." },
      { question: "How do cruise passengers get to the whale watching boats?", answer: "Excursions include round-trip motorcoach or van shuttle transportation from the downtown Juneau cruise terminal (Mt. Roberts Tramway plaza) to Auke Bay Harbor (approx. 20–25 minutes each way)." },
      { question: "How long does a Juneau whale watching tour take?", answer: "Standalone whale watching tours take approximately 3 to 3.5 hours total (2 to 2.5 hours on the water). Combined Whale Watching + Mendenhall Glacier tours take 5 to 5.5 hours total." },
      { question: "Can we see bald eagles and seabirds on Juneau whale watching tours?", answer: "Yes. In addition to humpback whales, Auke Bay boat tours frequently pass bald eagle nests along the forested shoreline, as well as Marbled Murrelets, Pigeon Guillemots, and Pelagic Cormorants foraging in the marine passages." },
      { question: "What happens if our cruise ship arrives late or misses port?", answer: "Independent operators track ship berthing in real time. If your vessel arrives late, departures are adjusted. If a port call is canceled, you receive a 100% full refund automatically." },
    ],
    related: [
      { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" },
      { href: "/guides/juneau-whale-watching-vs-mendenhall", label: "Whales vs Mendenhall guide" },
      { href: "/guides/best-alaska-cruise-ports-for-bird-watching", label: "Alaska bird watching guide" },
      { href: "/juneau/helicopter-tours", label: "Helicopter glacier tours" },
      { href: "/juneau/private-tours", label: "Private whale charters" },
    ],
  },
  {
    port: "juneau",
    topic: "mendenhall-glacier-tours",
    title: "Mendenhall Glacier Tours from Juneau Cruise Port (2026 Guide)",
    h1: "Mendenhall Glacier tours from Juneau cruise port",
    description: "Compare Mendenhall Glacier excursions from the Juneau cruise port: authorized shuttles, guided lake canoe/kayak paddles, Nugget Falls walks, and combo tours.",
    intro: "Mendenhall Glacier is located 13 miles northwest of the downtown Juneau cruise docks. Compare authorized commercial shuttles, lake canoe and kayak paddles, guided West Glacier hikes, and float trips departing directly from the cruise docks with guaranteed USFS permits and return timing.",
    chooserTopic: "glaciers",
    keywords: ["mendenhall"],
    eyebrow: "Authorized USFS Access · 13 Miles from Cruise Docks",
    decisionTitle: "How to experience Mendenhall Glacier on a port day",
    decisionIntro: "Because the US Forest Service strictly caps commercial visitor permits, booking an authorized tour in advance is essential.",
    decisionPoints: [
      { title: "Authorized shuttle & visitor center", text: "2.5 to 3 hours total. Includes USFS pass, Visitor Center exhibits, photo points, and the popular 2-mile (45 min) flat walk to Nugget Falls." },
      { title: "Mendenhall Lake canoe & kayak paddle", text: "Paddle across the iceberg-filled lake in stable voyageur canoes or kayaks to reach within yards of the glacier face and Nugget Falls." },
      { title: "Whale watching + Mendenhall combo", text: "5 to 5.5 hours total. Covers both signature Juneau highlights in one coordinated booking with guaranteed ship-return timing." },
    ],
    faqs: [
      { question: "How far is Mendenhall Glacier from the Juneau cruise port?", answer: "Mendenhall Glacier is 13 miles northwest of downtown Juneau, taking 20 to 25 minutes by excursion shuttle from the Mt. Roberts Tram parking lot." },
      { question: "Can I take a taxi, Uber, or city bus to Mendenhall Glacier?", answer: "Taxis and Ubers can drop off at Mendenhall, but cellular reception is weak and driver shortages make finding a return ride very risky. The city bus drops passengers 1.5 miles away along the highway. Authorized tour shuttles guarantee your return seat." },
      { question: "Can you walk to Nugget Falls?", answer: "Yes. The Nugget Falls trail is a mostly flat, gravel 2-mile round-trip walk (about 45 minutes walking time) leading right to the cascading waterfall and shoreline views of the glacier terminus." },
      { question: "Are US Forest Service entrance passes included?", answer: "Yes. All organized commercial shuttles and guided excursions include your USFS Mendenhall Glacier Recreation Area permit and Visitor Center admission." },
    ],
    related: [
      { href: "/juneau/whale-watching", label: "Juneau whale watching" },
      { href: "/guides/how-to-get-to-mendenhall-glacier-from-cruise-port", label: "Getting to Mendenhall guide" },
      { href: "/juneau/glacier-tours", label: "All Juneau glacier tours" },
      { href: "/juneau/helicopter-tours", label: "Helicopter glacier landings" },
    ],
  },
  {
    port: "juneau",
    topic: "helicopter-tours",
    title: "Juneau Helicopter Glacier Tours: Prices, Treks & Dog Sledding (2026)",
    h1: "Juneau helicopter tours, glacier treks and prices",
    description: "Compare Juneau helicopter tour prices, glacier landings, guided walks, treks and dog sledding flights. 100% weather refund guarantee and cruise dock pickup.",
    intro: "Experience the vast 1,500-square-mile Juneau Icefield from the air. Compare scenic glacier landings (Herbert, Norris, Taku Glaciers), guided ice walks, extended technical glacier treks (NorthStar style), and high-elevation dog sledding camps (TEMSCO style) with certified FAA Part 135 air operators and cruise port transfers.",
    chooserTopic: "flightseeing",
    keywords: ["helicopter", "flightseeing", "icefield", "glacier walk", "glacier trek", "dog sled", "pilot's choice", "temsco", "northstar", "coastal"],
    eyebrow: "100% Weather Refund Guarantee · Cruise Dock Shuttles",
    decisionTitle: "Choose your Juneau helicopter experience tier",
    decisionIntro: "Price and duration vary based on what you do once the helicopter lands on the Juneau Icefield.",
    decisionPoints: [
      { title: "Scenic flight + glacier landing ($360–$420)", text: "2.25 to 2.5 hours total (30–35 min flight + 20–25 min walking on glacier ice). Overboots provided. Excellent for all ages and fitness levels." },
      { title: "Guided glacier ice walk & trek ($550–$749)", text: "3 to 5.25 hours total. Includes 1 to 3 hours of guided walking or technical ice trekking with crampons, harnesses, and ice axes on deep icefield terrain." },
      { title: "Helicopter glacier dog sledding ($650–$799)", text: "2.75 to 3 hours total. Fly to a high-elevation glacier snow camp on Herbert or Norris Glacier, meet 200+ Alaskan huskies, and ride a real snow dog sled." },
    ],
    faqs: [
      { question: "How much do Juneau helicopter tours cost?", answer: "Prices start at $360–$420 per passenger for scenic glacier landings, $550–$749 for guided glacier ice walks and treks, and $650–$799 for helicopter dog sledding on snow." },
      { question: "What happens if mountain weather cancels my helicopter flight?", answer: "If fog, wind, or low cloud ceilings prevent safe flying, passengers receive an immediate 100% full refund with zero cancellation penalties, or the option to rebook if your port time permits." },
      { question: "How do cruise passengers get to the helicopter base?", answer: "All helicopter tours include round-trip van and shuttle transportation from the downtown Juneau cruise docks (Mt. Roberts Tram plaza) directly to the heliport at Juneau International Airport (JNU)." },
      { question: "Do I need special boots or gear for walking on the glacier?", answer: "No specialty gear needed. The flight base equips all guests with neoprene traction overboots that slip directly over your sneakers or walking shoes. Treks provide crampons and gear." },
    ],
    related: [
      { href: "/juneau/dog-sledding", label: "Juneau dog sledding" },
      { href: "/juneau/glacier-tours", label: "Juneau glacier tours" },
      { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" },
      { href: "/juneau/whale-watching", label: "Juneau whale watching" },
    ],
  },
  {
    port: "juneau",
    topic: "dog-sledding",
    title: "Juneau Dog Sledding Tours: Glacier Flights & Summer Camps (2026)",
    h1: "Juneau dog sledding tours & glacier dog camps",
    description: "Compare Juneau dog sledding excursions: helicopter glacier snow camps on the Juneau Icefield and rainforest summer dog camps for cruise passengers.",
    intro: "Dog sledding in Juneau offers two distinct styles: high-altitude helicopter flights landing on Juneau Icefield snow camps (Herbert and Norris Glaciers) to ride on real snow, and rainforest summer camps where Iditarod mushers train Alaskan husky teams on wheeled dirt carts.",
    chooserTopic: "dog-sledding",
    keywords: ["dog sled", "dogsled", "sledding", "husky", "mushing", "temsco"],
    eyebrow: "Real Snow Glacier Camps & Rainforest Summer Camps",
    decisionTitle: "Glacier snow sledding vs rainforest cart camps",
    decisionIntro: "Choose between a high-elevation alpine snow experience and an accessible ground-based dog camp.",
    decisionPoints: [
      { title: "Helicopter glacier dog sledding ($650–$799)", text: "Fly by helicopter to a remote alpine glacier camp, meet veteran mushers and Alaskan huskies, and ride a sled across actual snowfields." },
      { title: "Rainforest summer dog camp ($149–$189)", text: "Travel by coach into the Tongass rainforest to meet racing huskies, cuddle puppies, and ride a custom wheeled cart along forest trails." },
      { title: "Cruise passenger transit & weather policy", text: "Glacier flights include full weather refunds and van transfers from the downtown docks; rainforest camps operate rain or shine." },
    ],
    faqs: [
      { question: "Can you do dog sledding on real snow during a summer cruise?", answer: "Yes! High on the Juneau Icefield, snow remains all summer. Helicopter operators establish seasonal snow camps from May through August with hundreds of sled dogs." },
      { question: "What is the difference between glacier sledding and summer camp?", answer: "Glacier sledding uses a helicopter to reach mountain snow ($650–$799). Summer dog camp is accessible by bus and uses wheeled carts in the rainforest ($149–$189)." },
      { question: "Do cruise passengers get to hold husky puppies?", answer: "Yes! Both glacier camps and summer dog camps feature nursery areas where guests can interact with and hold newborn Alaskan husky puppies." },
    ],
    related: [
      { href: "/juneau/helicopter-tours", label: "Juneau helicopter tours" },
      { href: "/juneau/glacier-tours", label: "Juneau glacier tours" },
      { href: "/ports/juneau", label: "All Juneau excursions" },
    ],
  },
  {
    port: "juneau",
    topic: "fishing",
    title: "Juneau Fishing Charters: Salmon, Halibut & Private Trips",
    h1: "Juneau fishing charters for cruise passengers",
    description: "Compare guided Juneau fishing trips, salmon and halibut charters, combination trips and private boats with current prices and live booking calendars.",
    intro: "Compare guided fishing trips that can work with a Juneau cruise stop. Separate salmon, halibut, combination and private-charter choices first; then check the exact departure, trip length, fishing-license requirements and return timing for your ship day.",
    chooserTopic: "fishing",
    keywords: ["fishing", "salmon", "halibut", "charter"],
    exclude: ["salmon bake"],
    eyebrow: "Auke Bay Departures · Salmon & Halibut Charters",
    decisionTitle: "Salmon, halibut or a private Juneau charter?",
    decisionIntro: "These are different trips with different price structures. Start with the species and boat format instead of comparing every listing as though it were the same product.",
    decisionPoints: [
      { title: "Salmon fishing", text: "A focused choice for travelers primarily interested in salmon. Check season, trip length and whether licenses or processing are included." },
      { title: "Halibut or combination trips", text: "Often longer or more timing-sensitive. Confirm the operator considers your ship window workable before booking." },
      { title: "Private fishing charter", text: "Priced for the boat or private group rather than just one seat. Compare total group cost, passenger limit and target species." },
    ],
    faqs: [
      { question: "Can I take a Juneau fishing charter during a cruise stop?", answer: "Many fishing departures are designed for visitors, but fit depends on your ship's port window and the charter's actual departure and return time. Confirm both before booking." },
      { question: "Should I choose salmon or halibut fishing in Juneau?", answer: "Choose based on season, trip duration and the kind of fishing experience you want. Halibut and combination trips may require more time; the operator can confirm what is realistic on your date." },
      { question: "Is a private Juneau fishing charter priced per person?", answer: "Private charter listings may show a whole-boat price, while shared trips commonly show a passenger rate. Read the rate description and passenger capacity before comparing totals." },
      { question: "Are fishing licenses and fish processing included?", answer: "Inclusions vary by operator. Check the individual charter details for licenses, gear, catch processing, shipping arrangements, taxes and gratuities." },
    ],
    related: [
      { href: "/ports/juneau", label: "All Juneau excursions" },
      { href: "/juneau/whale-watching", label: "Juneau whale watching" },
      { href: "/guides/how-long-does-it-take-to-get-off-the-ship-in-juneau", label: "Juneau cruise-port timing" },
    ],
  },
  {
    port: "juneau",
    topic: "gold-panning",
    title: "Alaska Gold Panning Tours in Juneau for Cruise Passengers",
    h1: "Alaska gold panning tours from Juneau",
    description: "Compare Juneau gold panning and historic gold mining excursions, including gold-panning and salmon-bake combinations for Alaska cruise days.",
    intro: "Juneau's gold-rush history is available in hands-on excursions ranging from focused panning experiences to combination trips with a salmon bake. Compare the current choices and check the live departure against your cruise-port time.",
    chooserTopic: "best-overall",
    keywords: ["gold panning", "gold mining", "panning adventure"],
    exclude: [],
    eyebrow: "Gold Creek & Historic Mining Ruins",
    decisionTitle: "What to compare on a gold panning tour",
    decisionIntro: "The key difference is whether you want a focused hands-on activity or a broader history-and-meal combination.",
    decisionPoints: [
      { title: "Hands-on panning", text: "Prioritizes learning the technique and trying it yourself. Check transportation, accessibility and total activity time." },
      { title: "Mining history", text: "Adds interpretation about Juneau's gold-rush era and historic mining locations." },
      { title: "Panning + salmon bake", text: "Combines two popular Alaska experiences in one departure. Compare the total duration with your port window." },
    ],
    faqs: [
      { question: "Can cruise passengers take a gold panning tour in Juneau?", answer: "Yes, when the departure and return fit the ship's port window. Confirm the current meeting point and all-aboard time before booking." },
      { question: "Do Alaska gold panning tours let you keep the gold?", answer: "Policies and the type of material used can vary. Check the individual operator description for exactly what participants may keep." },
    ],
    related: [
      { href: "/ports/juneau", label: "All Juneau excursions" },
      { href: "/skagway/gold-rush-tours", label: "Skagway Gold Rush tours" },
      { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" },
    ],
  },
  {
    port: "juneau",
    topic: "glacier-tours",
    title: "Juneau Glacier Tours: Mendenhall, Icefields & Treks",
    h1: "Juneau glacier tours and icefield adventures",
    description: "Compare Juneau glacier excursions from scenic Mendenhall viewing to lake canoe paddles, helicopter landings and guided ice treks.",
    intro: "Juneau is the glacier capital of Southeast Alaska cruise itineraries. Compare four distinct ways to experience glaciers: scenic visitor-center viewing, lake kayaking and canoeing, helicopter ice landings, and guided crampon ice treks on the Juneau Icefield.",
    chooserTopic: "glaciers",
    keywords: ["glacier", "icefield", "trek", "mendenhall", "norris", "taku", "herbert", "northstar"],
    eyebrow: "Signature Juneau Glacier Experiences",
    decisionTitle: "View from shore, paddle the lake, or fly to the ice?",
    decisionIntro: "Glacier days vary dramatically in physical intensity and price. Match your activity level and timing with your ship's port schedule.",
    decisionPoints: [
      { title: "Scenic viewing & trails", text: "Best for families and relaxed pacing. Paved visitor center paths and flat walks to Nugget Falls." },
      { title: "Lake paddling & canoeing", text: "Paddle right up toward the terminus across Mendenhall Lake in stable voyageur canoes or kayaks." },
      { title: "Helicopter ice landings & treks", text: "Fly deep onto the icefield to step onto ancient blue ice with professional glacier guides (NorthStar / TEMSCO)." },
    ],
    faqs: [
      { question: "How close do you get to Mendenhall Glacier on a tour?", answer: "Viewing trails reach within 0.75 miles across the lake, while canoe and helicopter tours bring passengers right up to the glacier face or directly onto the ice." },
      { question: "What should I wear on a Juneau glacier tour?", answer: "Dress in warm layers with a waterproof jacket. Helicopter and trek operators provide specialty traction overboots, crampons, and rain gear." },
    ],
    related: [
      { href: "/juneau/mendenhall-glacier-tours", label: "Mendenhall Glacier tours" },
      { href: "/juneau/helicopter-tours", label: "Helicopter glacier flights" },
      { href: "/guides/how-to-get-to-mendenhall-glacier-from-cruise-port", label: "Getting to Mendenhall guide" },
    ],
  },
  {
    port: "juneau",
    topic: "easy-shore-excursions",
    title: "Easy Juneau Shore Excursions: Accessible & Low-Walking Tours",
    h1: "Easy Juneau shore excursions for cruise passengers",
    description: "Compare relaxing, low-walking Juneau excursions: covered whale watching catamarans, scenic Mendenhall drives, tramway, and salmon bakes.",
    intro: "Not every Alaska cruise day needs to be an extreme wilderness trek. If you are traveling with seniors, young kids, or prefer a relaxed pace, these connected Juneau excursions feature enclosed heated seating, minimal walking, and step-free or low-step transportation.",
    chooserTopic: "best-overall",
    keywords: ["salmon bake", "tramway", "sightseeing", "scenic", "city tour", "whale", "mendenhall"],
    eyebrow: "Comfortable, Low-Stress Cruise Days",
    decisionTitle: "Comfortable sightseeing with zero stress",
    decisionIntro: "Enjoy Southeast Alaska's greatest sights without steep hikes or rugged terrain.",
    decisionPoints: [
      { title: "Heated catamaran whale watching", text: "Enjoy panoramic indoor viewing windows, outdoor decks, and comfortable indoor seating." },
      { title: "Scenic coach & Mendenhall viewing", text: "Ride directly from the cruise docks with drop-off right at the visitor center entrance." },
      { title: "Historic salmon bake & mining camp", text: "All-you-can-eat Alaskan salmon in a sheltered rainforest setting with seated gold panning." },
    ],
    faqs: [
      { question: "Are these tours wheelchair accessible?", answer: "Many catamaran and coach tours accommodate folding wheelchairs and walkers. Check specific operator notes or call ahead for motorized scooter guidelines." },
      { question: "How much walking is required?", answer: "Most easy excursions require less than a quarter-mile of level walking on paved or boardwalk surfaces." },
    ],
    related: [
      { href: "/ports/juneau", label: "All Juneau excursions" },
      { href: "/guides/easy-alaska-shore-excursions", label: "Alaska easy tours guide" },
      { href: "/juneau/whale-watching", label: "Juneau whale watching" },
    ],
  },
  {
    port: "juneau",
    topic: "private-tours",
    title: "Private Juneau Shore Excursions: Whale & Charter Boats",
    h1: "Private Juneau shore excursions and custom charters",
    description: "Book private Juneau excursions for your family or group: private whale watching boats, custom fishing charters, and private vans.",
    intro: "Experience Juneau on your own terms with a private boat or vehicle charter. Perfect for families, private parties, or photographers seeking undivided attention, customizable itineraries, and dedicated on-time ship return.",
    chooserTopic: "private-premium",
    keywords: ["private", "charter", "exclusive", "custom"],
    eyebrow: "VIP & Private Group Charters",
    decisionTitle: "Why choose a private Juneau excursion?",
    decisionIntro: "Private charters eliminate tour bus crowds and adapt the day entirely to your family's pace.",
    decisionPoints: [
      { title: "Private whale watching boats", text: "Up to 6 or 12 passengers on an exclusive yacht with dedicated naturalist and captain." },
      { title: "Private fishing charters", text: "The whole boat dedicated to your anglers for salmon and halibut with customized departure times." },
      { title: "Custom private vans", text: "Explore Mendenhall, the shrine of St. Therese, and local scenic lookouts on your schedule." },
    ],
    faqs: [
      { question: "Are private tours priced per person or for the boat?", answer: "Most private charters are priced as a flat rate for the entire vessel or van (typically 6 passengers), making them economical for families." },
      { question: "Can private tours adjust to my ship's arrival?", answer: "Yes. Private operators track your vessel's docking in real time and greet you curbside at disembarkation." },
    ],
    related: [
      { href: "/juneau/whale-watching", label: "Juneau whale watching" },
      { href: "/juneau/fishing", label: "Juneau fishing charters" },
      { href: "/guides/private-premium-alaska-shore-excursions", label: "Private Alaska tours guide" },
    ],
  },
  {
    port: "ketchikan",
    topic: "bear-tours",
    title: "Ketchikan Bear Tours: Herring Cove, Traitors Cove & Anan Creek (2026)",
    h1: "Ketchikan bear tours & wildlife viewing",
    description: "Compare Ketchikan bear viewing excursions: guided rainforest tours at Herring Cove, remote fly-in viewing at Traitors Cove and Anan Creek, and wildlife safaris.",
    intro: "Peak bear viewing around Ketchikan runs from mid-July through September during peak salmon runs. Compare guided rainforest drive tours to Herring Cove viewing platforms and wilderness fly-in floatplane excursions to Traitors Cove, Anan Creek, and Neets Bay.",
    chooserTopic: "wildlife-whales",
    keywords: ["bear", "traitor's cove", "anan creek", "herring cove", "wildlife"],
    eyebrow: "Black Bear Viewing · July to September Salmon Runs",
    decisionTitle: "Choose your Ketchikan bear viewing format",
    decisionIntro: "Select between an accessible coastal rainforest sanctuary and a remote wilderness floatplane flight.",
    decisionPoints: [
      { title: "Rainforest sanctuary at Herring Cove ($120–$180)", text: "Travel by coach to elevated boardwalk platforms over salmon spawning streams where black bears actively feed." },
      { title: "Fly-in wilderness bear viewing ($495–$650)", text: "Fly by floatplane to remote USFS bear observatories like Anan Creek or Traitor's Cove with guaranteed wilderness guides." },
      { title: "Marine & wildlife boat safaris ($165–$215)", text: "High-speed zodiac and catamaran tours exploring coastal coves where bears forage along the shoreline at low tide." },
    ],
    faqs: [
      { question: "When is the best month to see bears in Ketchikan?", answer: "Mid-July through early September is peak season, coinciding with the massive salmon runs up Ketchikan streams like Herring Cove and Ward Creek." },
      { question: "Are bear viewing excursions safe for children?", answer: "Yes. Sanctuary viewing takes place from elevated timber boardwalks and secured platforms with experienced naturalists." },
    ],
    related: [
      { href: "/ketchikan/wildlife-tours", label: "Ketchikan wildlife tours" },
      { href: "/ketchikan/misty-fjords", label: "Misty Fjords floatplanes" },
      { href: "/ports/ketchikan", label: "All Ketchikan excursions" },
    ],
  },
  {
    port: "ketchikan",
    topic: "misty-fjords",
    title: "Misty Fjords Tours from Ketchikan: Compare Your Options",
    h1: "Misty Fjords tours from Ketchikan",
    description: "Compare Misty Fjords flightseeing, boat and expedition-style tours from Ketchikan, with current prices and live calendars for cruise passengers.",
    intro: "Misty Fjords National Monument can be experienced by air, water or a more private expedition-style trip. Compare the connected choices by transportation, total duration and price, then open the live calendar for a departure that fits your Ketchikan port day.",
    chooserTopic: "flightseeing",
    keywords: ["misty fjords", "misty", "taquanair", "floatplane", "seaplane"],
    eyebrow: "Ketchikan's strongest search-demand cluster",
    decisionTitle: "How do you want to see Misty Fjords?",
    decisionIntro: "The experience changes substantially depending on whether the trip is primarily in the air or on the water.",
    decisionPoints: [
      { title: "Flightseeing floatplane ($330–$395)", text: "1.5 to 2 hours total with an active water landing on a remote alpine fjord. Scenic window seats for every passenger." },
      { title: "Catamaran boat cruise ($220–$280)", text: "4.5 to 5 hours total. Dramatic sea-level views of 3,000-foot granite cliffs and waterfalls." },
      { title: "Private seaplane charter", text: "An entire de Havilland floatplane reserved for your family with flexible departure times." },
    ],
    faqs: [
      { question: "How do you tour Misty Fjords from Ketchikan?", answer: "Common formats include floatplane flightseeing (1.5–2 hours) and water-based catamaran cruises (4.5–5 hours). Floatplanes offer stunning aerial views and water landings." },
      { question: "Will a Misty Fjords tour work with my cruise schedule?", answer: "Yes, tours depart from Ketchikan harbor right near the cruise berths, allowing ample return cushion before ship all-aboard." },
    ],
    related: [
      { href: "/ports/ketchikan", label: "Ketchikan cruise-port guide" },
      { href: "/ketchikan/adventure-tours", label: "Ketchikan adventure tours" },
      { href: "/categories/flightseeing", label: "All Alaska flightseeing" },
    ],
  },
  {
    port: "ketchikan",
    topic: "kayaking",
    title: "Ketchikan Kayaking & Sea Canoe Shore Excursions (2026)",
    h1: "Ketchikan kayaking and sea canoe tours",
    description: "Compare Ketchikan sea kayaking and canoe excursions with Ketchikan Kayak Co and local guides. Clover Pass, Orca Cove, and Tongass coastal paddling.",
    intro: "Ketchikan's protected waterways and temperate rainforest coastline offer premier sea kayaking. Compare guided excursions at Clover Pass (Ketchikan Kayak Co style), Orca Cove, and Tatoosh Islands featuring stable tandem kayaks, waterproof paddling gear, and eagle viewing.",
    chooserTopic: "adventure",
    keywords: ["kayak", "canoe", "paddle", "kayakketchikan", "clover pass"],
    eyebrow: "Protected Coastal Waters · Tandem Sea Kayaks",
    decisionTitle: "Sea kayaking in the Tongass rainforest",
    decisionIntro: "Protected island channels make Ketchikan kayaking calm and suitable for beginners.",
    decisionPoints: [
      { title: "Clover Pass & coastal islands ($145–$185)", text: "3 to 3.5 hours total (approx. 2 hours paddling). Explore kelp beds, marine wildlife, and bald eagle nesting sites." },
      { title: "Wilderness canoe paddles", text: "Team paddling in large stable voyageur canoes along secluded mountain lakes and rainforest bays." },
      { title: "Beginner-friendly gear & transfers", text: "Includes full spray skirts, waterproof paddle jackets, life vests, and van transfers from the cruise docks." },
    ],
    faqs: [
      { question: "Do I need sea kayaking experience for Ketchikan tours?", answer: "No experience is needed. Tours use wide, ultra-stable tandem kayaks with professional safety guides providing full paddling instruction." },
      { question: "What wildlife can you see while kayaking in Ketchikan?", answer: "Paddlers frequently encounter bald eagles, Pigeon Guillemots, Great Blue Herons, harbor seals, sea lions, starfish, sea anemones, and occasional humpback whales or porpoises." },
    ],
    related: [
      { href: "/ketchikan/adventure-tours", label: "Ketchikan adventure tours" },
      { href: "/ketchikan/wildlife-tours", label: "Ketchikan wildlife tours" },
      { href: "/guides/best-alaska-cruise-ports-for-bird-watching", label: "Alaska bird watching guide" },
      { href: "/ports/ketchikan", label: "All Ketchikan excursions" },
    ],
  },
  {
    port: "ketchikan",
    topic: "adventure-tours",
    title: "Ketchikan Adventure Tours: Kart Expeditions, Kayaking & Ziplines",
    h1: "Ketchikan adventure tours & kart expeditions",
    description: "Compare active Ketchikan shore excursions: Adventure Kart Expedition at Whipple Creek, Ketchikan Kayak Co sea kayaking, canopy ziplines, and snorkeling.",
    intro: "For active cruise passengers, Ketchikan delivers thrilling rainforest adventures: drive custom Tomcar utility vehicles on the Adventure Kart Expedition at Whipple Creek (AdventureVue), paddle protected coastal waters with Ketchikan Kayak Co, or zipline through old-growth rainforest canopies.",
    chooserTopic: "adventure",
    keywords: ["kayak", "canoe", "utv", "jeep", "zipline", "snorkel", "zodiac", "kart", "safari", "adventurevue", "kayakketchikan"],
    eyebrow: "Off-Road Karts, Sea Kayaking & Canopy Ziplines",
    decisionTitle: "Select your Ketchikan adventure",
    decisionIntro: "Active tours take you deep into the rugged Tongass National Forest with all gear supplied.",
    decisionPoints: [
      { title: "Adventure Kart Expedition ($195–$250)", text: "Drive 2-person rough-terrain Tomcars through mountain logging trails, switchbacks, and rainforest mud tracks with scenic overlook stops." },
      { title: "Coastal sea kayaking ($145–$185)", text: "Paddles in stable tandem sea kayaks around Clover Pass and coastal marine channels with frequent seal and eagle sightings." },
      { title: "Rainforest canopy ziplines ($160–$199)", text: "Glide across 8 canopy ziplines and suspension bridges high above old-growth cedar and hemlock trees." },
    ],
    faqs: [
      { question: "What is the Adventure Kart Expedition in Ketchikan?", answer: "It is an off-road driving tour where participants operate 2-person automatic Tomcar rough-terrain vehicles through scenic mountain trails in the Tongass National Forest." },
      { question: "Is a driver's license required for adventure kart tours?", answer: "Yes. Drivers must present a valid government driver's license. Non-drivers and younger passengers can ride in the passenger seat." },
    ],
    related: [
      { href: "/ketchikan/kayaking", label: "Ketchikan kayaking" },
      { href: "/ketchikan/bear-tours", label: "Ketchikan bear tours" },
      { href: "/ports/ketchikan", label: "All Ketchikan excursions" },
    ],
  },
  {
    port: "ketchikan",
    topic: "wildlife-tours",
    title: "Ketchikan Wildlife & Eagle Tours for Cruise Passengers",
    h1: "Ketchikan wildlife tours, eagle viewing & rainforest birds",
    description: "Explore Ketchikan wildlife excursions: coastal bald eagle viewing, marine mammal safaris, rainforest sanctuaries, and salmon streams.",
    intro: "Known as the Gateway to Alaska, Ketchikan's pristine coastal rainforest hosts North America's highest concentration of bald eagles, alongside black bears, harbor seals, and humpback whales. Compare connected wildlife excursions with live cruise-day departure schedules.",
    chooserTopic: "wildlife-whales",
    keywords: ["wildlife", "eagle", "sanctuary", "rainforest", "seal", "marine", "bear", "bird"],
    eyebrow: "Rich Coastal Rainforest Wildlife",
    decisionTitle: "Choose your Ketchikan wildlife habitat",
    decisionIntro: "View wildlife from open zodiacs on coastal waters or from elevated walkways in old-growth rainforest.",
    decisionPoints: [
      { title: "Rainforest sanctuary & raptors", text: "Walk elevated boardwalks through mossy old-growth forests with active raptor rescue centers and dense bald eagle nesting." },
      { title: "Zodiac & marine wildlife safaris", text: "Drive or ride in high-speed inflatable boats along remote islands and marine channels." },
      { title: "Coastal stream bear viewing", text: "Observe black bears feeding on returning pink and chum salmon during mid-summer runs." },
    ],
    faqs: [
      { question: "When is the best time to see bears in Ketchikan?", answer: "Black bears are most reliably seen from mid-July through September when salmon swim upstream to spawn in local creeks like Herring Cove." },
      { question: "Can I see bald eagles and coastal birds on Ketchikan wildlife tours?", answer: "Yes. Ketchikan has one of the densest bald eagle nesting populations in North America. Wildlife boat excursions and rainforest sanctuary tours regularly pass eagle nests, Great Blue Herons, Belted Kingfishers, and Harlequin Ducks along the Tongass coastline." },
      { question: "Are wildlife tours in Ketchikan suitable for kids?", answer: "Yes. Sanctuary walking tours and boat safaris are engaging and informative for all ages." },
    ],
    related: [
      { href: "/ketchikan/bear-tours", label: "Ketchikan bear tours" },
      { href: "/ketchikan/misty-fjords", label: "Misty Fjords excursions" },
      { href: "/guides/best-alaska-cruise-ports-for-bird-watching", label: "Alaska bird watching guide" },
      { href: "/ports/ketchikan", label: "Ketchikan cruise port guide" },
    ],
  },
  {
    port: "ketchikan",
    topic: "easy-shore-excursions",
    title: "Easy Ketchikan Shore Excursions: Duck Tours, Trolley & Culture",
    h1: "Easy Ketchikan shore excursions for cruise passengers",
    description: "Compare relaxed, low-walking Ketchikan tours: Ketchikan Duck amphibious tours, historic town trolleys, totem parks, and covered cruises.",
    intro: "Ketchikan's historic downtown is famously walkable, and these low-impact excursions provide fantastic sightseeing with minimal physical exertion. Perfect for seniors, families with young children, or travelers who want a relaxed Alaska port day.",
    chooserTopic: "best-overall",
    keywords: ["duck", "trolley", "totem", "saxman", "historic", "creek street", "town", "akduck"],
    eyebrow: "Low-Walking & Family Friendly",
    decisionTitle: "See Ketchikan with zero physical strain",
    decisionIntro: "Explore native totem poles, historic Creek Street, and harbor wildlife from comfortable seating.",
    decisionPoints: [
      { title: "Ketchikan Duck amphibious tour", text: "Ride through historic downtown then splash into the harbor waters for a scenic cruise." },
      { title: "Saxman Native Village cultural tour", text: "Travel by coach to explore genuine Tlingit totem poles, carving sheds, and tribal dances." },
      { title: "Covered harbor catamaran", text: "Warm, enclosed catamarans touring Tongass Narrows without exposure to rain." },
    ],
    faqs: [
      { question: "How far is Creek Street from the Ketchikan cruise berths?", answer: "Creek Street is just 2 to 3 blocks (a 5-minute flat walk) from Berths 1, 2, and 3." },
      { question: "Is the Ketchikan Duck Tour wheelchair accessible?", answer: "The amphibious vehicle has stairs to board; operators assist guests and can stow folding wheelchairs." },
    ],
    related: [
      { href: "/ports/ketchikan", label: "All Ketchikan excursions" },
      { href: "/guides/first-time-in-ketchikan-shore-excursions", label: "First time in Ketchikan guide" },
      { href: "/ketchikan/misty-fjords", label: "Misty Fjords tours" },
    ],
  },
  {
    port: "ketchikan",
    topic: "private-tours",
    title: "Private Ketchikan Shore Excursions: Hummer, Boat & Flight Charters",
    h1: "Private Ketchikan shore excursions and luxury charters",
    description: "Book private Ketchikan shore excursions: luxury Hummer rainforest tours, private wildlife boats, and exclusive Misty Fjords floatplanes.",
    intro: "Experience Ketchikan privately with your family or traveling group. Enjoy dedicated pickup directly from your berth, customizable stops at totem parks, waterfalls, and scenic viewpoints, and personalized back-to-ship coordination.",
    chooserTopic: "private-premium",
    keywords: ["hummer", "private", "charter", "exclusive", "custom", "akhummer"],
    eyebrow: "Exclusive Group & Private Charters",
    decisionTitle: "Tailor Ketchikan to your group",
    decisionIntro: "Private transport offers unmatched flexibility for photography, multi-generational families, and relaxed exploring.",
    decisionPoints: [
      { title: "Luxury Hummer rainforest exploration", text: "Ride in private comfort with your personal local guide along scenic coastal roads." },
      { title: "Private Misty Fjords floatplane", text: "An entire de Havilland seaplane dedicated to your party for flightseeing and remote water landings." },
      { title: "Private boat & fishing charters", text: "Target salmon and halibut or cruise secluded fjords with your private captain." },
    ],
    faqs: [
      { question: "Can private Ketchikan tours accommodate Ward Cove cruise ships?", answer: "Yes. Private drivers provide direct greeting at the Ward Cove Welcome Center or the downtown shuttle drop-off." },
    ],
    related: [
      { href: "/ketchikan/misty-fjords", label: "Misty Fjords flightseeing" },
      { href: "/ports/ketchikan", label: "Ketchikan port guide" },
      { href: "/guides/private-premium-alaska-shore-excursions", label: "Private Alaska tours guide" },
    ],
  },
  {
    port: "skagway",
    topic: "helicopter-tours",
    title: "Skagway Helicopter Tours and Glacier Flightseeing",
    h1: "Skagway helicopter tours & glacier landings",
    description: "Compare connected Skagway helicopter excursions and glacier flightseeing with TEMSCO Air Skagway. Glacier landings, dock pickup, and weather refund protections.",
    intro: "Skagway's helicopter flightseeing inventory features dramatic aerial ascents over Sawtooth Ridge, the Taiya Inlet, and landings on Chilkat Glacier. Compare connected glacier flights with live departure checks before booking.",
    chooserTopic: "flightseeing",
    keywords: ["helicopter", "glacier discovery", "flightseeing", "temscoair-skagway", "temsco"],
    eyebrow: "Sawtooth Ridge & Chilkat Glacier Landings",
    decisionTitle: "Fly over Skagway's rugged mountain passes",
    decisionIntro: "Helicopter tours in Skagway offer dramatic alpine topography right outside port.",
    decisionPoints: [
      { title: "Sawtooth Ridge & glacier landing ($350–$410)", text: "2 to 2.5 hours total. Scenic flight over rugged peaks and a walking landing on the ancient ice of Chilkat Glacier." },
      { title: "Denver Glacier helicopter dog sledding ($650–$750)", text: "Fly to an alpine snow camp on Denver Glacier for dog sledding on real snow with Alaskan racing teams." },
      { title: "Weather cancellation policy", text: "100% full refund if mountain weather or low cloud ceilings prevent flight operations." },
    ],
    faqs: [
      { question: "Where do Skagway helicopter tours depart from?", answer: "Shuttles pick up cruise passengers directly near the Skagway cruise docks and transfer them to the Skagway heliport in under 10 minutes." },
      { question: "Is Skagway helicopter flightseeing suitable for cruise passengers?", answer: "Yes. Tours run 2 to 2.5 hours, leaving plenty of time to explore historic Broadway and return to your ship well before all-aboard." },
    ],
    related: [
      { href: "/skagway/dog-sledding", label: "Skagway dog sledding" },
      { href: "/skagway/adventure-tours", label: "Skagway adventure tours" },
      { href: "/ports/skagway", label: "All Skagway excursions" },
    ],
  },
  {
    port: "skagway",
    topic: "gold-rush-tours",
    title: "Skagway Gold Rush Tours and Liarsville Excursions",
    h1: "Skagway Gold Rush tours & Liarsville camp",
    description: "Compare connected Skagway Gold Rush and Liarsville excursions for cruise passengers: gold panning, historic camp reenactments, and salmon bakes.",
    intro: "Skagway was the epicenter of the 1898 Klondike Gold Rush. Compare excursions visiting the historic Liarsville Gold Rush Trail Camp, authentic gold panning, melodrama performances, and scenic coach trips up the Klondike Highway.",
    chooserTopic: "best-overall",
    keywords: ["gold rush", "liarsville", "gold", "panning"],
    eyebrow: "1898 Klondike Gold Rush History",
    decisionTitle: "Experience the 1898 Gold Rush hands-on",
    decisionIntro: "Enjoy authentic living history, gold panning, and campfire salmon bakes close to port.",
    decisionPoints: [
      { title: "Liarsville Gold Rush Trail Camp & salmon bake", text: "Seated gold panning, campfire cooking, live music, and historic camp reenactments." },
      { title: "Historic town & White Pass overlook tour", text: "Ride through the national historic district and up to panoramic mountain viewpoints." },
      { title: "Klondike Gold Rush boardwalks", text: "Stroll the flat historic wooden sidewalks of Broadway right from the ship docks." },
    ],
    faqs: [
      { question: "Is gold guaranteed on Skagway gold panning tours?", answer: "Yes. Every participant is taught the traditional prospector pan technique and keeps all the real gold flakes they pan." },
      { question: "How long are Skagway Gold Rush tours?", answer: "Most tours run 2 to 3.5 hours and depart right from downtown Skagway or the pier shuttle stop." },
    ],
    related: [
      { href: "/skagway/adventure-tours", label: "Skagway scooters & adventure" },
      { href: "/skagway/easy-shore-excursions", label: "Easy Skagway tours" },
      { href: "/ports/skagway", label: "All Skagway excursions" },
    ],
  },
  {
    port: "skagway",
    topic: "dog-sledding",
    title: "Skagway Dog Sledding and Glacier Dog Tours",
    h1: "Skagway dog sledding tours & Denver Glacier",
    description: "Compare connected Skagway dog sledding and glacier dog experiences: Denver Glacier helicopter flights and Dyea cart mushing.",
    intro: "Skagway offers two dog-sledding formats: high-altitude helicopter glacier dog sledding on Denver Glacier ($650–$750) and summer dirt-cart sledding through the scenic Dyea valley ($140–$180). Use this page to compare connected choices with live departure checks.",
    chooserTopic: "dog-sledding",
    keywords: ["dog", "sled", "dogsled", "husky", "denver glacier", "dyea"],
    eyebrow: "Glacier Helicopter Sledding & Dyea Cart Mushing",
    decisionTitle: "Choose your Skagway dog sledding experience",
    decisionIntro: "Select between alpine glacier snow sledding and accessible rainforest cart mushing.",
    decisionPoints: [
      { title: "Denver Glacier helicopter dog sledding", text: "Fly by helicopter to an alpine snow camp on Denver Glacier for real snow sledding with veteran mushers." },
      { title: "Dyea valley summer cart mushing", text: "Ride wheeled training carts pulled by powerful Alaskan huskies along rainforest trails in scenic Dyea." },
      { title: "Puppy socialization & musher talks", text: "Both formats include hands-on time petting sled dogs and holding newborn husky puppies." },
    ],
    faqs: [
      { question: "Where do Skagway dog sledding tours meet?", answer: "Tours provide shuttle pickups at the Skagway Small Boat Harbor or directly outside your cruise berth gangway." },
    ],
    related: [
      { href: "/skagway/helicopter-tours", label: "Skagway helicopter tours" },
      { href: "/skagway/adventure-tours", label: "Skagway adventure tours" },
      { href: "/ports/skagway", label: "All Skagway excursions" },
    ],
  },
  {
    port: "skagway",
    topic: "adventure-tours",
    title: "Skagway Adventure Tours: Scooters, Glacier Flights & Active Excursions",
    h1: "Skagway adventure tours & scooter excursions",
    description: "Compare active Skagway shore excursions: Skagway Scooters Gold Rush Adventure, electric rentals to Dyea, glacier helicopter flights, and river rafting.",
    intro: "Skagway's active shore excursions include the popular Skagway Scooters Gold Rush Adventure and electric scooter rentals exploring scenic Dyea Road, TEMSCO Air helicopter glacier landings over Sawtooth Ridge, and Taiya River raft floats along the Chilkoot Trail.",
    chooserTopic: "adventure",
    keywords: ["scooter", "helicopter", "glacier", "adventure", "skagwayscooters", "raft", "chilkoot", "dyea"],
    eyebrow: "Skagway Scooters, Glacier Flights & Taiya Rafting",
    decisionTitle: "Active outdoor exploration in Skagway",
    decisionIntro: "Small-group adventure excursions offer an energetic alternative to crowded tour buses.",
    decisionPoints: [
      { title: "Skagway Scooters & rentals ($110–$150)", text: "Ride easy-to-handle electric scooters along historic Broadway, coastal viewpoints, and Gold Rush trails out to Dyea Tidal Flats." },
      { title: "Sawtooth Ridge helicopter glacier flight ($350–$410)", text: "2.5 hours total. Fly high over jagged peaks and land on Chilkat Glacier for a guided ice walk." },
      { title: "Taiya River scenic raft float ($145–$185)", text: "Hike a portion of the historic Chilkoot Trail and enjoy a gentle float down the Taiya River with eagle viewing." },
    ],
    faqs: [
      { question: "How do Skagway scooter tours work for cruise ship passengers?", answer: "Skagway Scooters departs from 2nd Avenue, just a 5 to 10-minute walk from the cruise ship docks. Guided Gold Rush tours and 3 to 5-hour electric rentals allow you to explore Dyea and coastal viewpoints on your own schedule." },
      { question: "Do I need a motorcycle or driver's license for Skagway scooters?", answer: "A standard valid automobile driver's license is required. Comprehensive safety briefings and helmets are included." },
      { question: "Will active adventure tours return in time for my cruise ship?", answer: "Yes. All tours run 2.5 to 4 hours and finish with a mandatory 60+ minute safety cushion prior to your ship's all-aboard." },
    ],
    related: [
      { href: "/skagway/gold-rush-tours", label: "Skagway Gold Rush tours" },
      { href: "/skagway/helicopter-tours", label: "Skagway helicopter flights" },
      { href: "/guides/best-alaska-cruise-ports-for-bird-watching", label: "Alaska bird watching guide" },
      { href: "/ports/skagway", label: "All Skagway excursions" },
    ],
  },
  {
    port: "skagway",
    topic: "easy-shore-excursions",
    title: "Easy Skagway Shore Excursions: Historic Town & Liarsville Camp",
    h1: "Easy Skagway shore excursions for cruise passengers",
    description: "Compare easy, low-walking Skagway excursions: Liarsville Gold Rush camp, historic town tours, salmon bakes, and scenic overlooks.",
    intro: "Skagway is nestled in a flat valley surrounded by towering peaks, making it exceptionally visitor-friendly. If you prefer low-impact sightseeing, compare these accessible excursions featuring seated gold panning, live melodrama, and comfortable coach travel to scenic White Pass lookouts.",
    chooserTopic: "best-overall",
    keywords: ["liarsville", "camp", "gold", "historic", "scenic", "town"],
    eyebrow: "Accessible Gold Rush History",
    decisionTitle: "Experience the Klondike Gold Rush comfortably",
    decisionIntro: "Discover authentic 1898 history without demanding hikes or long trail marches.",
    decisionPoints: [
      { title: "Liarsville Gold Rush Camp & salmon bake", text: "Seated gold panning, campfire cooking, and historic camp reenactments." },
      { title: "Historic town & White Pass overlook tour", text: "Ride through the national historic district and up to panoramic mountain viewpoints." },
      { title: "Klondike Gold Rush boardwalks", text: "Stroll the flat historic wooden sidewalks of Broadway right from the ship docks." },
    ],
    faqs: [
      { question: "Is Skagway walkable from the cruise ship docks?", answer: "Yes. Skagway's historic district is just a 5 to 10-minute flat walk from the Ore and Broadway docks, and a short shuttle ride from Railroad Dock." },
      { question: "Is the Liarsville Gold Rush tour wheelchair accessible?", answer: "Yes, the camp features flat gravel paths, seated gold panning troughs, and accessible dining tents." },
    ],
    related: [
      { href: "/ports/skagway", label: "Skagway port guide" },
      { href: "/guides/best-things-to-do-in-skagway-4-6-hours", label: "Skagway in 4-6 hours guide" },
      { href: "/skagway/gold-rush-tours", label: "Skagway Gold Rush tours" },
    ],
  },
  {
    port: "skagway",
    topic: "private-tours",
    title: "Private Skagway Shore Excursions: Custom Vans & Scenic Charters",
    h1: "Private Skagway shore excursions and custom tours",
    description: "Book private Skagway shore excursions: private passenger vans to the Yukon border, custom gold rush history, and exclusive departures.",
    intro: "Discover the breathtaking Klondike Highway and historic Skagway in the comfort of a private passenger vehicle. Enjoy dedicated pickup at your ship gangway, flexible photo stops at waterfalls and alpine lakes, and personalized travel to the Yukon border.",
    chooserTopic: "private-premium",
    keywords: ["private", "charter", "custom", "van"],
    eyebrow: "Personalized Klondike Exploration",
    decisionTitle: "Travel beyond the bus crowds",
    decisionIntro: "A private vehicle allows your party to dictate stops, explore pristine mountain passes, and travel at your own pace.",
    decisionPoints: [
      { title: "Private Klondike Highway vans", text: "Travel past White Pass summit to the Yukon suspension bridge and emerald lakes with a private guide." },
      { title: "Custom Gold Rush history outings", text: "Combine Liarsville, Dyea ghost town, and historic Skagway according to your interests." },
    ],
    faqs: [
      { question: "Do you need a passport for Skagway private road tours?", answer: "If your tour travels up the Klondike Highway past the Canadian border into British Columbia or Yukon Territory, valid passports are mandatory for all passengers." },
    ],
    related: [
      { href: "/ports/skagway", label: "All Skagway excursions" },
      { href: "/skagway/helicopter-tours", label: "Skagway helicopter flights" },
      { href: "/guides/private-premium-alaska-shore-excursions", label: "Private Alaska tours guide" },
    ],
  },
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
  const canonical = `https://www.welcometoalaskatours.com/${config.port}/${config.topic}`;
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
  const canonical = `https://www.welcometoalaskatours.com/${config.port}/${config.topic}`;
  const geoFact = getAlaskaGeoFact(config.port, config.topic);

  const combinedFaqs = [
    ...(config.faqs || []),
    ...(geoFact?.faqSchema || []).filter(
      (gf) => !(config.faqs || []).some((cf) => cf.question.toLowerCase() === gf.question.toLowerCase())
    ),
  ];

  const schemas = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Alaska Tours", item: "https://www.welcometoalaskatours.com" },
      { "@type": "ListItem", position: 2, name: `${portTitle} excursions`, item: `https://www.welcometoalaskatours.com/ports/${config.port}` },
      { "@type": "ListItem", position: 3, name: config.h1, item: canonical },
    ] },
    ...(combinedFaqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: combinedFaqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] : []),
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

      {/* DIRECT ANSWER CARD FOR GOOGLE AI OVERVIEWS */}
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <GeoDirectAnswerCard fact={geoFact} />
      </div>

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
