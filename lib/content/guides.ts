export type GuideFAQ = {
  question: string;
  answer: string;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  port?: "juneau" | "skagway" | "ketchikan";
  topic:
    | "port-planning"
    | "wildlife"
    | "budget"
    | "packing"
    | "sustainability"
    | "timing";
  targetKeyword: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  intro: string;
  sections: Array<{
    heading: string;
    points: string[];
  }>;
  faqs: GuideFAQ[];
};

const publishedAt = "2026-03-10";

function section(heading: string, points: string[]) {
  return { heading, points };
}

export const guides: Guide[] = [
  {
    slug: "best-juneau-shore-excursions-2026",
    title: "Best Juneau Shore Excursions for 2026 Cruise Visits",
    description:
      "A practical Juneau planning guide for cruise travelers: whale watching, Mendenhall options, timing windows, and how to book with confidence.",
    port: "juneau",
    topic: "port-planning",
    targetKeyword: "best Juneau shore excursions for cruise",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 8,
    intro:
      "Juneau usually gives you one shot at a great port day, so your excursion choice should match your docking window and return buffer.",
    sections: [
      section("What sells out first in Juneau", [
        "Whale watching departures that fit major cruise schedules.",
        "Combo itineraries with wildlife viewing and Mendenhall stops.",
        "Small-group morning slots during peak season.",
      ]),
      section("Cruise-day timing rules", [
        "Use practical disembark timing, not official dock time.",
        "Keep a return buffer before all-aboard.",
        "Prioritize operators that regularly host cruise guests.",
      ]),
    ],
    faqs: [
      {
        question: "Are Juneau whale watching tours worth booking in advance?",
        answer: "Yes. Prime departures often fill early in peak season.",
      },
      {
        question: "Can I do Mendenhall and whale watching in one day?",
        answer: "Often yes, if your ship has a long call and you keep buffers.",
      },
    ],
  },
  {
    slug: "skagway-white-pass-railway-independent-booking",
    title: "Skagway White Pass Railway: Independent Booking Guide",
    description:
      "How to plan White Pass day timing from a cruise port call, choose departure windows, and avoid missed-return risk when booking independently.",
    port: "skagway",
    topic: "timing",
    targetKeyword: "Skagway white pass railway independent booking",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 7,
    intro:
      "White Pass is one of the most requested Skagway experiences, but independent booking only works if timing is managed precisely.",
    sections: [
      section("Departure strategy", [
        "Pick a slot after realistic pier exit time.",
        "Leave room for shuttle and queue time.",
        "Avoid late return options on short calls.",
      ]),
      section("Risk controls", [
        "Keep confirmations available offline.",
        "Confirm check-in location before leaving port.",
        "Review cancellation and rebooking terms.",
      ]),
    ],
    faqs: [
      {
        question: "Is independent White Pass booking cheaper than ship excursions?",
        answer: "Sometimes, but compare total duration and transfer value too.",
      },
      {
        question: "How much return buffer should I keep in Skagway?",
        answer: "A meaningful safety margin is recommended before all-aboard.",
      },
    ],
  },
  {
    slug: "ketchikan-whale-watching-cruise-excursion-guide",
    title: "Ketchikan Whale Watching Cruise Excursion Guide",
    description:
      "How to choose Ketchikan whale watching departures by schedule fit, group type, and weather reality so your port day stays low-stress.",
    port: "ketchikan",
    topic: "wildlife",
    targetKeyword: "Ketchikan whale watching cruise excursion",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 6,
    intro:
      "Ketchikan wildlife moments are strong, but the best choice depends on dock window and your group pace.",
    sections: [
      section("What matters most", [
        "Departure alignment with your ship window.",
        "Clear transfer and check-in instructions.",
        "Weather communication and backup expectations.",
      ]),
      section("Avoid common mistakes", [
        "Do not pick latest departure just because it is open.",
        "Verify whether duration includes transport.",
        "Confirm rate class and final price before payment.",
      ]),
    ],
    faqs: [
      {
        question: "Are Ketchikan whale tours good for first-time Alaska visitors?",
        answer: "Yes, they are popular because logistics are straightforward.",
      },
      {
        question: "Should I book morning or afternoon in Ketchikan?",
        answer: "Choose the slot that best fits your ship timing.",
      },
    ],
  },
  {
    slug: "independent-alaska-shore-excursions-save-vs-ship",
    title: "Independent Alaska Shore Excursions: Save vs Ship Excursions",
    description:
      "A practical comparison of independent vs ship-booked excursions for Alaska cruises, including timing risk, pricing clarity, and booking safeguards.",
    topic: "budget",
    targetKeyword: "Alaska cruise excursions cheaper than ship",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 9,
    intro:
      "Independent excursions can save money and improve choice, but only if timing and operator quality are strong.",
    sections: [
      section("Where independent booking wins", [
        "Broader departure and activity choices.",
        "Transparent per-person pricing.",
        "More control over day planning.",
      ]),
      section("Where ship excursions can be better", [
        "Very short calls with low risk tolerance.",
        "Travelers wanting single-vendor support.",
        "Complex accessibility requirements.",
      ]),
    ],
    faqs: [
      {
        question: "Are independent excursions always cheaper?",
        answer: "Not always. Compare full value, timing, and transfers.",
      },
      {
        question: "Will I still get confirmation documentation?",
        answer: "Yes, payment and booking confirmations should be provided.",
      },
    ],
  },
  {
    slug: "mendenhall-glacier-tour-from-juneau-cruise-port",
    title: "Mendenhall Glacier Tour from Juneau Cruise Port: Planning Guide",
    description:
      "How to plan Mendenhall-focused excursions from Juneau cruise port, including departure timing, group fit, and what to confirm before checkout.",
    port: "juneau",
    topic: "port-planning",
    targetKeyword: "Mendenhall Glacier tour from Juneau cruise port",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 7,
    intro:
      "Mendenhall is one of Juneau's most searched attractions and timing fit matters more than anything.",
    sections: [
      section("Pick the right format", [
        "Direct glacier-focused options for scenery and photos.",
        "Combo formats for wildlife plus glacier highlights.",
        "Shorter options for tight calls.",
      ]),
      section("Before checkout", [
        "Confirm date, departure, rate, and party size.",
        "Review cancellation policy.",
        "Save meeting instructions.",
      ]),
    ],
    faqs: [
      {
        question: "Can I combine Mendenhall and whale watching in one day?",
        answer: "Yes, often with combos or carefully spaced departures.",
      },
      {
        question: "Is this suitable for families?",
        answer: "Usually yes when you match the format to your group pace.",
      },
    ],
  },
  {
    slug: "best-skagway-shore-excursions-for-families",
    title: "Best Skagway Shore Excursions for Families",
    description:
      "Family-focused Skagway options with practical pacing, transfer simplicity, and return-time confidence for cruise travelers.",
    port: "skagway",
    topic: "port-planning",
    targetKeyword: "best skagway shore excursions for families",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 6,
    intro: "Skagway has excellent family-friendly options when you prioritize low-friction timing and realistic activity length.",
    sections: [
      section("Family-friendly selection rules", [
        "Choose shorter transit and easier check-in logistics.",
        "Confirm walking expectations before booking.",
        "Keep one major activity plus flexible town time.",
      ]),
    ],
    faqs: [
      { question: "Do kids need the same ticket as adults?", answer: "Rates vary by operator and age band, so verify rate labels carefully." },
      { question: "How early should families leave the ship?", answer: "Plan for realistic disembark and pier transit time, not minimum assumptions." },
    ],
  },
  {
    slug: "juneau-whale-watching-best-time-of-day",
    title: "Juneau Whale Watching: Best Time of Day for Cruise Travelers",
    description:
      "How to choose Juneau whale watching departures by cruise timing, weather variability, and port-day constraints.",
    port: "juneau",
    topic: "wildlife",
    targetKeyword: "best time whale watching juneau cruise",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 5,
    intro: "Time-of-day preferences matter less than choosing departures that fit your actual dock schedule with buffer.",
    sections: [
      section("Morning vs afternoon", [
        "Choose based on ship schedule fit first.",
        "Leave return margin before all-aboard.",
        "Track weather variability and operator guidance.",
      ]),
    ],
    faqs: [
      { question: "Is morning always better?", answer: "Not always. Schedule fit and return confidence are more important." },
      { question: "How long are most tours?", answer: "Durations vary; confirm if listed time includes transfers." },
    ],
  },
  {
    slug: "ketchikan-rainy-day-excursion-plan",
    title: "Ketchikan Rainy-Day Excursion Plan for Cruise Guests",
    description:
      "Practical Ketchikan planning for wet weather days, including what to prioritize and how to keep the day smooth.",
    port: "ketchikan",
    topic: "timing",
    targetKeyword: "ketchikan rainy day cruise excursions",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 5,
    intro: "Rain is common in Ketchikan, so choose excursions that still run well and keep transfers predictable.",
    sections: [
      section("Rain-smart planning", [
        "Pick activities with clear wet-weather operations.",
        "Carry layers and waterproof basics.",
        "Keep return buffer in case of slower transfers.",
      ]),
    ],
    faqs: [
      { question: "Do operators cancel in rain?", answer: "Many operate in rain; severe weather policies vary by operator." },
      { question: "What should I pack for Ketchikan?", answer: "Light waterproof shell, layered mid-layer, and non-slip shoes." },
    ],
  },
  {
    slug: "alaska-shore-excursion-budget-planner",
    title: "Alaska Shore Excursion Budget Planner for Cruise Travelers",
    description:
      "A budget framework for selecting Alaska excursions across ports without sacrificing schedule fit or tour quality.",
    topic: "budget",
    targetKeyword: "alaska shore excursion budget planner",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 7,
    intro: "A clear budget plan helps you pick high-value excursions and avoid overbooking the same day.",
    sections: [
      section("Budget allocation model", [
        "Set per-port budget caps before browsing.",
        "Prioritize one premium activity and one lower-cost option.",
        "Compare value by timing reliability, not only base fare.",
      ]),
    ],
    faqs: [
      { question: "Should I book all ports before sailing?", answer: "Book high-demand tours early, then leave room for flexible options." },
      { question: "Are combo tours always better value?", answer: "Only if combined timing and pace fit your group." },
    ],
  },
  {
    slug: "what-to-pack-for-alaska-port-days",
    title: "What to Pack for Alaska Port Days and Shore Excursions",
    description:
      "A practical cruise-port packing checklist for Alaska weather, wildlife outings, and variable activity intensity.",
    topic: "packing",
    targetKeyword: "what to pack for alaska shore excursions",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 6,
    intro: "Packing for Alaska is about layers, comfort, and staying adaptable across changing weather windows.",
    sections: [
      section("Essentials", [
        "Waterproof outer layer and layered insulation.",
        "Comfortable non-slip footwear.",
        "Compact day bag with water and documents.",
      ]),
      section("Nice-to-have extras", [
        "Binoculars for wildlife viewing.",
        "Portable battery and offline confirmations.",
        "Sunscreen and lip protection.",
      ]),
    ],
    faqs: [
      { question: "Do I need heavy winter gear in summer?", answer: "Usually no; layered, water-resistant clothing is typically enough." },
      { question: "Should I bring passports to shore?", answer: "Follow cruise guidance and carry the required identification for your itinerary." },
    ],
  },
  {
    slug: "juneau-port-day-timing-template",
    title: "Juneau Port-Day Timing Template (Avoid Missed Return Stress)",
    description:
      "A simple Juneau port-day template to sequence transfers, tours, and return buffers around cruise all-aboard times.",
    port: "juneau",
    topic: "timing",
    targetKeyword: "juneau port day itinerary timing",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 5,
    intro: "A realistic timing template reduces stress and helps you enjoy one or two well-placed activities.",
    sections: [
      section("Template blocks", [
        "Disembark + transit window.",
        "Primary excursion block.",
        "Optional low-risk second block.",
        "Return buffer before all-aboard.",
      ]),
    ],
    faqs: [
      { question: "Can I stack multiple excursions in one port?", answer: "Yes, but only when transfer and duration assumptions are conservative." },
      { question: "How much return buffer is enough?", answer: "Use a meaningful margin based on operator return guidance and pier logistics." },
    ],
  },
  {
    slug: "skagway-excursions-for-short-port-calls",
    title: "Skagway Excursions for Short Port Calls",
    description:
      "Best-practice selection for Skagway when your ship has a shorter docking window and little margin for delay.",
    port: "skagway",
    topic: "timing",
    targetKeyword: "skagway excursions for short port calls",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 5,
    intro: "Short calls require low-variance tours, easy transfer logistics, and strict return planning.",
    sections: [
      section("Selection rules", [
        "Favor tours with predictable durations.",
        "Avoid far transfers when time is tight.",
        "Book mid-window departures with return buffer.",
      ]),
    ],
    faqs: [
      { question: "Are short calls still worth booking excursions?", answer: "Yes, if you choose lower-risk formats with clear timing." },
      { question: "Should I skip independent bookings on short calls?", answer: "Not necessarily, but timing discipline becomes critical." },
    ],
  },
  {
    slug: "ketchikan-wildlife-and-rainforest-combo-guide",
    title: "Ketchikan Wildlife and Rainforest Combo Guide",
    description:
      "How to evaluate Ketchikan combo excursions for wildlife sightings, rainforest access, and realistic cruise-day pacing.",
    port: "ketchikan",
    topic: "wildlife",
    targetKeyword: "ketchikan wildlife rainforest combo excursion",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 6,
    intro: "Combo tours can deliver strong value in Ketchikan when you verify transfer time and activity pacing.",
    sections: [
      section("Combo evaluation checklist", [
        "Verify total duration includes transportation.",
        "Check physical activity expectations.",
        "Confirm return schedule confidence.",
      ]),
    ],
    faqs: [
      { question: "Are combo tours too rushed?", answer: "Some are, so check detailed schedules before booking." },
      { question: "Do combos reduce flexibility?", answer: "Yes, but they can simplify logistics for first-time visitors." },
    ],
  },
  {
    slug: "alaska-cruise-sustainability-and-responsible-touring",
    title: "Alaska Cruise Sustainability and Responsible Touring",
    description:
      "Responsible touring basics for Alaska cruise guests, including wildlife distance, local impact, and low-waste port-day habits.",
    topic: "sustainability",
    targetKeyword: "alaska sustainable shore excursions",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 6,
    intro: "Small planning choices can reduce impact while still delivering memorable wildlife and landscape experiences.",
    sections: [
      section("Responsible touring habits", [
        "Follow operator guidance for wildlife distance.",
        "Use refillable bottles and reduce single-use waste.",
        "Support local operators with clear stewardship policies.",
      ]),
    ],
    faqs: [
      { question: "Can sustainability and convenience both be prioritized?", answer: "Yes, with small pre-trip choices and informed operator selection." },
      { question: "Do responsible operators explain guidelines on tour?", answer: "Most quality operators provide clear conduct expectations." },
    ],
  },
  {
    slug: "juneau-vs-skagway-which-port-for-your-main-excursion",
    title: "Juneau vs Skagway: Which Port Should Get Your Main Excursion Budget?",
    description:
      "A side-by-side planning framework to allocate your top excursion budget between Juneau and Skagway.",
    topic: "budget",
    targetKeyword: "juneau vs skagway excursion comparison",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 7,
    intro: "If you can only splurge once, allocate spend where activity fit and timing confidence are strongest for your trip goals.",
    sections: [
      section("Decision framework", [
        "Match activity priority to each port's strengths.",
        "Compare available call length and logistics.",
        "Use one premium booking plus lower-cost balance.",
      ]),
    ],
    faqs: [
      { question: "Is Juneau always the better splurge port?", answer: "Not always; itinerary timing and your interests should decide." },
      { question: "Should I split budget equally?", answer: "Usually better to prioritize one standout port experience." },
    ],
  },
  {
    slug: "ketchikan-shore-excursions-first-time-cruisers",
    title: "Ketchikan Shore Excursions for First-Time Alaska Cruisers",
    description:
      "A first-timer playbook for choosing Ketchikan activities with simple logistics and strong sightseeing value.",
    port: "ketchikan",
    topic: "port-planning",
    targetKeyword: "ketchikan shore excursions first time cruiser",
    publishedAt,
    updatedAt: publishedAt,
    readMinutes: 5,
    intro: "First-time cruisers in Ketchikan should focus on straightforward logistics, realistic pacing, and weather-ready planning.",
    sections: [
      section("First-timer priorities", [
        "Select tours with clear meeting points.",
        "Confirm pace and walking expectations.",
        "Keep a return window buffer.",
      ]),
    ],
    faqs: [
      { question: "Should first-timers avoid independent tours?", answer: "Not necessarily, but choose operators experienced with cruise timelines." },
      { question: "How many excursions should I do in one day?", answer: "For most first-timers, one major tour is enough." },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((g) => g.slug === slug) || null;
}
