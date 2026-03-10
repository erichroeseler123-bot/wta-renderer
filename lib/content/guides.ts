export type GuideFAQ = {
  question: string;
  answer: string;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  port?: "juneau" | "skagway" | "ketchikan";
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

export const guides: Guide[] = [
  {
    slug: "best-juneau-shore-excursions-2026",
    title: "Best Juneau Shore Excursions for 2026 Cruise Visits",
    description:
      "A practical Juneau planning guide for cruise travelers: whale watching, Mendenhall options, timing windows, and how to book with confidence.",
    port: "juneau",
    targetKeyword: "best Juneau shore excursions for cruise",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-10",
    readMinutes: 8,
    intro:
      "Juneau usually gives you one shot at a great port day, so your excursion choice should match your docking window and return buffer. This guide breaks down what books fastest and how to avoid timing mistakes.",
    sections: [
      {
        heading: "What sells out first in Juneau",
        points: [
          "Whale watching departures with round-trip timing that fits major cruise schedules.",
          "Combo itineraries that include wildlife viewing and Mendenhall photo stops.",
          "Small-group departures with morning slots for early arrivals.",
        ],
      },
      {
        heading: "How to pick between whale watching and glacier-focused tours",
        points: [
          "Choose whale watching first if marine wildlife is your priority and weather flexibility matters.",
          "Choose a glacier-heavy experience if your group cares more about scenery and easier pacing.",
          "For families, compare transfer time and total walking so younger travelers stay comfortable.",
        ],
      },
      {
        heading: "Cruise-day timing rules",
        points: [
          "Book departures that start after your realistic disembark window, not official dock time.",
          "Keep a return buffer before all-aboard to absorb weather and pier transit delays.",
          "Prioritize operators that regularly host cruise guests and publish clear return expectations.",
        ],
      },
      {
        heading: "Booking checklist",
        points: [
          "Match your ship and date first, then compare departure windows.",
          "Confirm rate type and party size before paying.",
          "Keep your confirmation email and booking page handy on port day.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are Juneau whale watching tours worth booking in advance?",
        answer:
          "Yes. Prime departures often fill early during peak season, especially for cruise-friendly windows.",
      },
      {
        question: "Can I do Mendenhall and whale watching in one day?",
        answer:
          "Often yes, if your ship has a long port call. Choose a combo or align two shorter activities with safe buffers.",
      },
    ],
  },
  {
    slug: "skagway-white-pass-railway-independent-booking",
    title: "Skagway White Pass Railway: Independent Booking Guide",
    description:
      "How to plan White Pass day timing from a cruise port call, choose departure windows, and avoid missed-return risk when booking independently.",
    port: "skagway",
    targetKeyword: "Skagway white pass railway independent booking",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-10",
    readMinutes: 7,
    intro:
      "White Pass is one of the most requested Skagway experiences, but independent booking only works if you manage timing precisely. Use this guide to book confidently without over-stressing your port day.",
    sections: [
      {
        heading: "Why cruise travelers choose White Pass",
        points: [
          "Iconic route and scenery with low physical strain for mixed-age groups.",
          "Predictable activity duration compared with some weather-dependent tours.",
          "Easy to pair with short town-time when your call is limited.",
        ],
      },
      {
        heading: "Departure selection strategy",
        points: [
          "Pick a slot that starts after practical pier exit time, not earliest possible time.",
          "Leave room for shuttle, queue, and unexpected dock traffic.",
          "Avoid last-return options if your ship has strict all-aboard enforcement.",
        ],
      },
      {
        heading: "Port-day risk controls",
        points: [
          "Keep independent confirmation details available offline on your phone.",
          "Know exact check-in location before leaving the ship area.",
          "Confirm cancellation and rebooking terms before payment.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is independent White Pass booking cheaper than ship excursions?",
        answer:
          "It can be, but value depends on timing reliability and included transfers. Compare full door-to-door duration, not only base price.",
      },
      {
        question: "How much return buffer should I keep in Skagway?",
        answer:
          "Most cruise travelers aim for a meaningful safety margin before all-aboard to account for dock transit and lineups.",
      },
    ],
  },
  {
    slug: "ketchikan-whale-watching-cruise-excursion-guide",
    title: "Ketchikan Whale Watching Cruise Excursion Guide",
    description:
      "How to choose Ketchikan whale watching departures by schedule fit, group type, and weather reality so your port day stays low-stress.",
    port: "ketchikan",
    targetKeyword: "Ketchikan whale watching cruise excursion",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-10",
    readMinutes: 6,
    intro:
      "Ketchikan offers strong wildlife moments, but the best choice depends on your dock window and your group’s pace. Here is a simple way to choose a departure that protects your return timing.",
    sections: [
      {
        heading: "What matters most in Ketchikan bookings",
        points: [
          "Departure time alignment with your ship window.",
          "Reliable transfer and check-in instructions for cruise guests.",
          "Clear communication on weather, seas, and operational adjustments.",
        ],
      },
      {
        heading: "Family and mixed-group planning",
        points: [
          "Choose lower-friction transfer routes for children and older travelers.",
          "Verify onboard comfort expectations and trip length before booking.",
          "Pair one major excursion with flexible free time near port.",
        ],
      },
      {
        heading: "Avoiding common mistakes",
        points: [
          "Do not book the latest available departure just because it is open.",
          "Check whether activity duration includes transport or is on-water only.",
          "Validate final price and rate class before checkout.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are Ketchikan whale tours good for first-time Alaska visitors?",
        answer:
          "Yes. They are popular with first-time cruisers because logistics are straightforward and wildlife opportunities are strong.",
      },
      {
        question: "Should I book morning or afternoon in Ketchikan?",
        answer:
          "Choose the option that fits your ship call and minimizes rush; timing confidence usually matters more than time-of-day preference.",
      },
    ],
  },
  {
    slug: "independent-alaska-shore-excursions-save-vs-ship",
    title: "Independent Alaska Shore Excursions: Save vs Ship Excursions",
    description:
      "A practical comparison of independent vs ship-booked excursions for Alaska cruises, including timing risk, pricing clarity, and booking safeguards.",
    targetKeyword: "Alaska cruise excursions cheaper than ship",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-10",
    readMinutes: 9,
    intro:
      "Independent excursions can save money and improve choice, but they only work well if your timing and operator quality are strong. This guide helps you compare options with fewer surprises.",
    sections: [
      {
        heading: "Where independent booking wins",
        points: [
          "Broader departure and activity choices than fixed ship packages.",
          "Transparent per-person pricing and rate classes before payment.",
          "More control over your day plan across ports.",
        ],
      },
      {
        heading: "Where ship excursions may still be better",
        points: [
          "Very short port calls where risk tolerance is low.",
          "Travelers who prefer single-vendor support for every activity.",
          "Groups with strict accessibility requirements that need extra coordination.",
        ],
      },
      {
        heading: "How to book independently with confidence",
        points: [
          "Choose tours built for cruise timing and clear return expectations.",
          "Keep an explicit return buffer and avoid stacking too many activities.",
          "Use secure payment and keep confirmations available offline.",
        ],
      },
    ],
    faqs: [
      {
        question: "Are independent excursions always cheaper?",
        answer:
          "Not always. Compare total value, timing fit, and included transfers rather than only base fare.",
      },
      {
        question: "Will I still get confirmation documentation?",
        answer:
          "Yes. You should receive payment and booking confirmations with activity details and instructions.",
      },
    ],
  },
  {
    slug: "mendenhall-glacier-tour-from-juneau-cruise-port",
    title: "Mendenhall Glacier Tour from Juneau Cruise Port: Planning Guide",
    description:
      "How to plan Mendenhall-focused excursions from Juneau cruise port, including departure timing, group fit, and what to confirm before checkout.",
    port: "juneau",
    targetKeyword: "Mendenhall Glacier tour from Juneau cruise port",
    publishedAt: "2026-03-10",
    updatedAt: "2026-03-10",
    readMinutes: 7,
    intro:
      "Mendenhall is one of Juneau’s most searched attractions. The best tour choice depends on your ship timing, walking comfort, and how much of the day you want dedicated to glacier viewing.",
    sections: [
      {
        heading: "Choose the right glacier-day format",
        points: [
          "Direct glacier access options for travelers prioritizing scenery and photos.",
          "Combo formats for guests who want both glacier and wildlife highlights.",
          "Shorter formats for tighter port calls or lower-activity groups.",
        ],
      },
      {
        heading: "Timing and transfer considerations",
        points: [
          "Check whether listed duration includes transfer from cruise area.",
          "Account for pier congestion during peak arrival windows.",
          "Plan a comfortable buffer before all-aboard.",
        ],
      },
      {
        heading: "Before you book",
        points: [
          "Confirm the selected date, departure time, rate, and party size.",
          "Review cancellation rules and weather policy.",
          "Save confirmation details and meeting instructions.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I combine Mendenhall with whale watching the same day?",
        answer:
          "Yes, often through combo products or carefully spaced departures if your port call is long enough.",
      },
      {
        question: "Is this suitable for families and first-time visitors?",
        answer:
          "Usually yes. Select the tour format that matches your group pace and mobility preferences.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((g) => g.slug === slug) || null;
}
