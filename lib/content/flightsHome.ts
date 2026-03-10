export type FlightCard = {
  name: string;
  meta: string;
  copy: string;
  badge: string;
};

export type FlightFaq = {
  q: string;
  a: string;
};

export const flightsHomeContent = {
  heroTitle: "Jitterbug Sky Flights",
  heroText:
    "A playful, mobile-first flight homepage focused on one thing: quick booking for colorful sky rides.",
  primaryCtaLabel: "Book A Flight",
  primaryCtaHref: "/checkout",
  secondaryCtaLabel: "Ask Flight Team",
  secondaryCtaHref: "/contact-us",
  flights: [
    {
      name: "Jitterbug Pop Flight",
      meta: "20 mins • bright window views • easy ride",
      copy: "A bouncy, colorful intro flight for first-timers and families who want pure sky fun.",
      badge: "Most Playful",
    },
    {
      name: "Sky Scribble Loop",
      meta: "35 mins • smooth arcs • panoramic seats",
      copy: "Big scenic loops with extra glide time so everyone gets the wow moment.",
      badge: "Best Views",
    },
    {
      name: "Sunburst Hopper",
      meta: "45 mins • max airtime • photo-ready route",
      copy: "Longer air route with high-energy takeoff and broad horizon passes.",
      badge: "Longest Ride",
    },
  ] as FlightCard[],
  whyFly: ["Big windows", "Fast check-in", "Kid-happy vibe", "Photo moments"],
  faqs: [
    {
      q: "Are these flights beginner friendly?",
      a: "Yes. Every route is designed to feel exciting but smooth, and the crew briefs you before takeoff.",
    },
    {
      q: "How far ahead should I book?",
      a: "Book early for prime daylight slots. Last-minute seats can open, but popular hours fill first.",
    },
    {
      q: "What should I bring?",
      a: "Bring a light layer, phone or camera, and a smile. We keep the setup simple and fast.",
    },
  ] as FlightFaq[],
  footerTitle: "Ready To Fly?",
  footerText:
    "Use this page as your live editable flight-first homepage while your main homepage stays untouched.",
};
