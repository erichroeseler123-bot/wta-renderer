import type { Metadata } from "next";
import Link from "next/link";
import HomepageForm from "@/app/components/home/HomepageForm";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Alaska Cruise Port Excursions | Welcome To Alaska Tours",
  description:
    "Choose Juneau, Skagway, or Ketchikan, tell us what kind of Alaska day you want, and narrow the connected shore-excursion catalog to a four-tour shortlist.",
  alternates: { canonical: "https://welcometoalaskatours.com" },
};

const APPROVED_PORTS = [
  { slug: "juneau", title: "Juneau", image: "/hero/juneau.jpg", description: "Whales, Mendenhall, glacier flights, dog sledding, fishing and adventure." },
  { slug: "skagway", title: "Skagway", image: "/hero/skagway.jpg", description: "Glacier flights, Gold Rush experiences, scooters and cruise-day adventures." },
  { slug: "ketchikan", title: "Ketchikan", image: "/hero/ketchikan.png", description: "Misty Fjords, bears, rainforest, kayaking, UTVs, snorkeling and more." },
];

const TRIP_STYLES = [
  { icon: "🐋", title: "Wildlife & whales", text: "Whales, bears, rainforest and wildlife-focused experiences." },
  { icon: "🧊", title: "Glaciers", text: "Glacier views, icefields, Mendenhall, hikes and paddles." },
  { icon: "🚁", title: "Flightseeing", text: "Helicopters, seaplanes and Alaska scenery from the air." },
  { icon: "🐕", title: "Dog sledding", text: "Huskies, glacier camps and sled-dog experiences." },
  { icon: "🎣", title: "Fishing", text: "Salmon, halibut and private fishing charters." },
  { icon: "🛶", title: "Adventure", text: "Kayaks, canoes, Jeeps, UTVs, ziplines, hiking and snorkeling." },
  { icon: "☕", title: "Easy day", text: "Lower-friction sightseeing and simpler-paced choices." },
  { icon: "✨", title: "Private / premium", text: "Private charters and bigger once-in-a-lifetime splurges." },
];

const POPULAR_SEARCHES = [
  ["Juneau whale watching", "/juneau/whale-watching"],
  ["Mendenhall Glacier tours", "/juneau/mendenhall-glacier-tours"],
  ["Juneau helicopter tours", "/juneau/helicopter-tours"],
  ["Juneau dog sledding", "/juneau/dog-sledding"],
  ["Juneau fishing charters", "/juneau/fishing"],
  ["Ketchikan bear tours", "/ketchikan/bear-tours"],
  ["Misty Fjords tours", "/ketchikan/misty-fjords"],
  ["Ketchikan kayaking", "/ketchikan/kayaking"],
  ["Ketchikan adventure tours", "/ketchikan/adventure-tours"],
  ["Skagway helicopter tours", "/skagway/helicopter-tours"],
  ["Skagway Gold Rush tours", "/skagway/gold-rush-tours"],
  ["Skagway dog sledding", "/skagway/dog-sledding"],
  ["Skagway adventure tours", "/skagway/adventure-tours"],
] as const;

const HOME_FAQS = [
  {
    question: "Which Alaska cruise ports can I shop here?",
    answer: "Start with Juneau, Skagway, or Ketchikan. Each port page organizes the connected excursion inventory into easier shopping lanes so you can compare the kinds of experiences that fit that stop.",
  },
  {
    question: "Do I need to know my exact tour before I start?",
    answer: "No. Choose your port and the kind of day you want first. The finder narrows the connected excursion catalog to four choices worth comparing.",
  },
  {
    question: "Can I use my cruise ship schedule to narrow the choices?",
    answer: "Yes. Ship and port-date information can be used as planning filters. Always confirm the cruise line's actual all-aboard time and the tour operator's meeting instructions before booking.",
  },
  {
    question: "Where do I check current price and availability?",
    answer: "Open the live booking calendar from a tour page to review currently posted departures, price, capacity, and booking details.",
  },
  {
    question: "Can someone help me choose an Alaska shore excursion?",
    answer: "Yes. You can use the four-choice finder, browse by port or activity, or contact Welcome To Alaska Tours for help narrowing the options.",
  },
] as const;

const HOME_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <JsonLd data={HOME_FAQ_SCHEMA} />

      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-slate-950 py-16 text-white sm:py-24">
        <div className="absolute inset-0">
          <img src="/images/home-hero.jpg" alt="Alaska cruise port scenery" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/25 md:bg-gradient-to-r md:from-slate-950/90 md:via-slate-950/55 md:to-slate-950/20" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-200">
              Juneau · Skagway · Ketchikan
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Pick the Alaska day. We&apos;ll narrow the tours.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Start with your cruise port and the kind of day you want. We&apos;ll turn the connected excursion catalog into four choices worth comparing.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#find-your-port-day" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-7 py-3 text-sm font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-200">
                Find my best choices
              </a>
              <Link href="/tours" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-black uppercase tracking-wider text-white hover:bg-white/20">
                Browse all excursions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-sky-100 bg-sky-50 py-10">
        <div className="mx-auto grid max-w-5xl gap-4 px-6 sm:grid-cols-3">
          {[
            ["1", "Choose your port", "Juneau, Skagway or Ketchikan."],
            ["2", "Choose your kind of day", "Wildlife, glaciers, flightseeing, fishing, adventure and more."],
            ["3", "Compare four choices", "Then open the live calendar for actual departures, price and capacity."],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-[1.75rem] border border-sky-100 bg-white p-5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{step}</div>
              <h2 className="mt-4 text-base font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="find-your-port-day" className="mx-auto max-w-5xl scroll-mt-6 px-6 py-14">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-700">Start here</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">What sounds good in port?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">You do not need to know the tour name. Pick the port and the kind of Alaska experience you want; ship and date are optional until you are ready to check the calendar.</p>
        </div>
        <div className="mt-7">
          <HomepageForm approvedPorts={APPROVED_PORTS} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <Link href="/ports" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">First Alaska cruise?</div>
            <h2 className="mt-2 text-xl font-black text-slate-950">Start with the port, not the tour name.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">See what Juneau, Skagway and Ketchikan are best known for, then compare the excursion styles available at that stop.</p>
            <span className="mt-4 block text-sm font-black text-sky-800">Compare the ports →</span>
          </Link>
          <Link href="/ships" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Know your ship?</div>
            <h2 className="mt-2 text-xl font-black text-slate-950">Use the port window as a planning filter.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Start from your ship page to put the cruise-day timing beside the Alaska excursion choices you are considering.</p>
            <span className="mt-4 block text-sm font-black text-sky-800">Browse cruise ships →</span>
          </Link>
          <a href="#popular-searches" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Already know the experience?</div>
            <h2 className="mt-2 text-xl font-black text-slate-950">Go straight to the high-intent shopping pages.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Whale watching, Mendenhall, helicopters, dog sledding, fishing, Misty Fjords, bears and more are organized into focused comparison pages.</p>
            <span className="mt-4 block text-sm font-black text-sky-800">Jump to popular searches ↓</span>
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Eight ways to shop Alaska</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">These are decision shortcuts, not promises about suitability. The tour detail and live calendar remain the source for operator requirements, current timing and price.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRIP_STYLES.map((style) => (
            <a key={style.title} href="#find-your-port-day" className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-2xl">{style.icon}</div>
              <h3 className="mt-3 text-lg font-black text-slate-950">{style.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{style.text}</p>
              <span className="mt-4 block text-xs font-black text-sky-800">Choose in the finder →</span>
            </a>
          ))}
        </div>
      </section>

      <section id="popular-searches" className="mx-auto max-w-6xl scroll-mt-6 px-6 py-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Popular Alaska excursion searches</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Start with exactly what you want to do</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">These shopping pages pull together the connected tours for one specific port-day idea, then hand you into the four-choice finder or live calendar.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {POPULAR_SEARCHES.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-black text-slate-800 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900">
                {label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="ports" className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950">Or start with your port</h2>
          <p className="mt-2 text-sm text-slate-600">Each port page organizes the connected inventory into easier shopping lanes.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {APPROVED_PORTS.map((port) => (
            <Link key={port.slug} href={`/ports/${port.slug}`} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                <img src={port.image} alt={port.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-slate-950">{port.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{port.description}</p>
                <span className="mt-4 block text-xs font-black uppercase tracking-wider text-sky-800">Shop {port.title} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Know your ship already?</div>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Use the ship window as another filter.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Ship timing is planning guidance only. Always confirm the cruise line&apos;s actual all-aboard time and the operator&apos;s meeting instructions.</p>
          </div>
          <Link href="/ships" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white sm:mt-0">Browse ships</Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-700">Alaska shore excursion FAQ</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Questions people have before they pick a tour</h2>
        </div>
        <div className="mt-8 space-y-3">
          {HOME_FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none pr-8 text-base font-black text-slate-950 marker:content-none">
                {faq.question}
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 pt-4">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 text-white shadow-sm sm:p-9">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Need a human?</div>
          <div className="mt-2 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight">Not sure which Alaska day to choose?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Use the finder first, or contact us when you want help narrowing the options around your port, interests and cruise-day timing.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <a href="tel:+19077238908" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200">Call 907-723-8908</a>
              <Link href="/contact-us" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
