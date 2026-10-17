import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import HomepageForm from "@/app/components/home/HomepageForm";
import JsonLd from "@/components/seo/JsonLd";
import { readFinderChoices, type FinderSearchParams } from "@/lib/finderChoices";

export const metadata: Metadata = {
  title: "Alaska Cruise Port Excursions | Welcome To Alaska Tours",
  description:
    "Choose Juneau, Skagway, or Ketchikan, tell us what kind of Alaska day you want, and narrow the connected shore-excursion catalog to a four-tour shortlist.",
  alternates: { canonical: "https://www.welcometoalaskatours.com" },
};

const APPROVED_PORTS = [
  {
    slug: "juneau",
    title: "Juneau",
    image: "/images/home/port-juneau.webp",
    description: "Whales, Mendenhall, glacier flights, dog sledding, fishing and adventure.",
  },
  {
    slug: "skagway",
    title: "Skagway",
    image: "/images/home/port-skagway.webp",
    description: "Glacier flights, Gold Rush experiences, scooters and cruise-day adventures.",
  },
  {
    slug: "ketchikan",
    title: "Ketchikan",
    image: "/images/home/port-ketchikan.webp",
    description: "Misty Fjords, bears, rainforest, kayaking, UTVs, snorkeling and more.",
  },
];

const TRIP_STYLES = [
  { icon: "🐋", title: "Wildlife & whales", text: "Whales, bears, rainforest and wildlife-focused experiences.", href: "/juneau/whale-watching", image: "/images/home/exp-wildlife.webp" },
  { icon: "🧊", title: "Glaciers", text: "Glacier views, icefields, Mendenhall, hikes and paddles.", href: "/juneau/mendenhall-glacier-tours", image: "/images/home/exp-glaciers.webp" },
  { icon: "🚁", title: "Flightseeing", text: "Helicopters, seaplanes and Alaska scenery from the air.", href: "/juneau/helicopter-tours", image: "/images/home/exp-flightseeing.webp" },
  { icon: "🐕", title: "Dog sledding", text: "Huskies, glacier camps and sled-dog experiences.", href: "/juneau/dog-sledding", image: "/images/home/exp-dogsledding.webp" },
  { icon: "🎣", title: "Fishing", text: "Salmon, halibut and private fishing charters.", href: "/juneau/fishing", image: "/images/home/exp-fishing.webp" },
  { icon: "🛶", title: "Adventure", text: "Kayaks, canoes, Jeeps, UTVs, ziplines, hiking and snorkeling.", href: "/ketchikan/adventure-tours", image: "/images/home/exp-adventure.webp" },
  { icon: "☕", title: "Easy day", text: "Lower-friction sightseeing and simpler-paced choices.", href: "/guides/easy-alaska-shore-excursions", image: "/images/home/exp-easyday.webp" },
  { icon: "✨", title: "Private / premium", text: "Private charters and bigger once-in-a-lifetime splurges.", href: "/guides/private-premium-alaska-shore-excursions", image: "/images/home/exp-premium.webp" },
];

const POPULAR_SEARCHES = [
  ["Juneau whale watching", "/juneau/whale-watching"],
  ["Mendenhall Glacier tours", "/juneau/mendenhall-glacier-tours"],
  ["Juneau helicopter tour prices", "/juneau/helicopter-tours"],
  ["Juneau glacier ice treks", "/juneau/glacier-tours"],
  ["Juneau dog sledding", "/juneau/dog-sledding"],
  ["Juneau fishing charters", "/juneau/fishing"],
  ["Alaska gold panning tours", "/juneau/gold-panning"],
  ["Easy Juneau excursions", "/juneau/easy-shore-excursions"],
  ["Misty Fjords floatplanes", "/ketchikan/misty-fjords"],
  ["Ketchikan bear tours", "/ketchikan/bear-tours"],
  ["Ketchikan wildlife & eagles", "/ketchikan/wildlife-tours"],
  ["Ketchikan kayaking", "/ketchikan/kayaking"],
  ["Ketchikan adventure tours", "/ketchikan/adventure-tours"],
  ["Easy Ketchikan tours", "/ketchikan/easy-shore-excursions"],
  ["Skagway helicopter tours", "/skagway/helicopter-tours"],
  ["Skagway Gold Rush tours", "/skagway/gold-rush-tours"],
  ["Skagway dog sledding", "/skagway/dog-sledding"],
  ["Skagway adventure tours", "/skagway/adventure-tours"],
  ["Easy Skagway tours", "/skagway/easy-shore-excursions"],
  ["Best Juneau shore excursions", "/guides/best-shore-excursions-in-juneau"],
  ["Getting to Mendenhall Glacier", "/guides/how-to-get-to-mendenhall-glacier-from-cruise-port"],
  ["Whales vs Mendenhall", "/guides/juneau-whale-watching-vs-mendenhall"],
  ["Skagway in 4 to 6 hours", "/guides/best-things-to-do-in-skagway-4-6-hours"],
  ["First time in Ketchikan", "/guides/first-time-in-ketchikan-shore-excursions"],
  ["Alaska excursion costs", "/guides/how-much-do-alaska-shore-excursions-cost"],
  ["What if tour runs late?", "/guides/what-happens-if-my-alaska-tour-runs-late"],
] as const;

const HOME_FAQS = [
  {
    question: "Which Alaska cruise ports can I shop here?",
    answer:
      "Start with Juneau, Skagway, or Ketchikan. Each port page organizes the connected excursion inventory into easier shopping lanes so you can compare the kinds of experiences that fit that stop.",
  },
  {
    question: "Do I need to know my exact tour before I start?",
    answer:
      "No. Choose your port and the kind of day you want first. The finder narrows the connected excursion catalog to four choices worth comparing.",
  },
  {
    question: "Can I use my cruise ship schedule to narrow the choices?",
    answer:
      "Yes. Ship and port-date information can be used as planning filters. Always confirm the cruise line's actual all-aboard time and the tour operator's meeting instructions before booking.",
  },
  {
    question: "Where do I check current price and availability?",
    answer:
      "Open the live booking calendar from a tour page to review currently posted departures, price, capacity, and booking details.",
  },
  {
    question: "Can someone help me choose an Alaska shore excursion?",
    answer:
      "Yes. You can use the four-choice finder, browse by port or activity, or contact Welcome To Alaska Tours for help narrowing the options.",
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

const TOP_LINKS = [
  ["Ports", "/ports"],
  ["Experiences", "#experiences"],
  ["Ships", "/ships"],
  ["All tours", "/tours"],
] as const;

export default async function HomePage({ searchParams }: { searchParams: Promise<FinderSearchParams> }) {
  const initialChoices = readFinderChoices(await searchParams);
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e7] text-[#123632]">
      <JsonLd data={HOME_FAQ_SCHEMA} />

      <section className="relative isolate min-h-[860px] overflow-hidden bg-[#082522] text-white lg:min-h-[780px]">
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/home/hero-1920.webp"
            alt="Alaska cruise port scenery"
            fill
            priority
            sizes="100vw"
            quality={80}
            className="h-full w-full scale-[1.03] object-cover"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,29,27,.96)_0%,rgba(4,29,27,.82)_42%,rgba(4,29,27,.48)_67%,rgba(4,29,27,.22)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(3,24,22,.92)_0%,transparent_48%)]" />
        <div className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full border border-[#d7ff76]/20" />
        <div className="absolute -right-6 top-8 -z-10 h-44 w-44 rounded-full border border-white/10" />

        <div className="mx-auto max-w-7xl px-5 sm:px-7 lg:px-10">
          <header className="flex h-24 items-center justify-between border-b border-white/15">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[11px] font-black tracking-[0.16em] backdrop-blur-md transition group-hover:bg-white group-hover:text-[#082522]">
                AK
              </span>
              <span className="leading-none">
                <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Welcome to</span>
                <span className="mt-1 block text-lg font-black tracking-tight text-white">ALASKA TOURS</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {TOP_LINKS.map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-bold text-white/75 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>

            <a
              href="#find-your-port-day"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#d7ff76] px-5 text-xs font-black uppercase tracking-[0.13em] text-[#082522] shadow-[0_12px_35px_rgba(215,255,118,.22)] transition hover:scale-[1.02] hover:bg-white"
            >
              Find a tour
            </a>
          </header>

          <div className="grid gap-10 pb-24 pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.72fr)] lg:items-center lg:gap-14 lg:pb-28 lg:pt-20">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#d7ff76] shadow-[0_0_18px_rgba(215,255,118,.95)]" />
                Juneau · Skagway · Ketchikan
              </div>

              <h1 className="mt-7 max-w-4xl text-[3.45rem] font-black leading-[.86] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.4rem]">
                Pick your
                <span className="block text-[#d7ff76]">Alaska excursion.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-7 text-white/78 sm:text-xl sm:leading-8">
                Compare Juneau, Skagway and Ketchikan shore excursions by port and experience. We&apos;ll narrow the catalog to four choices actually worth comparing.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                <span className="rounded-full border border-white/20 bg-black/10 px-4 py-2 backdrop-blur-sm">Live booking calendars</span>
                <span className="rounded-full border border-white/20 bg-black/10 px-4 py-2 backdrop-blur-sm">Cruise-day planning</span>
                <span className="rounded-full border border-white/20 bg-black/10 px-4 py-2 backdrop-blur-sm">Provider &amp; terms shown before booking</span>
              </div>
            </div>

            <div id="find-your-port-day" className="scroll-mt-6 lg:pt-4">
              <HomepageForm key={JSON.stringify(initialChoices)} approvedPorts={APPROVED_PORTS} initialChoices={initialChoices} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#f4f0e7] [clip-path:polygon(0_100%,100%_100%,100%_30%,82%_55%,67%_14%,48%_55%,31%_22%,15%_62%,0_38%)]" />
      </section>

      <section className="bg-[#f4f0e7] px-5 pb-8 pt-6 sm:px-7 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {[
            ["01", "Choose your port", "Start with Juneau, Skagway or Ketchikan."],
            ["02", "Choose your kind of day", "Wildlife, glaciers, flightseeing, fishing and more."],
            ["03", "Compare only four", "Then open the live calendar for the details that matter."],
          ].map(([step, title, text]) => (
            <div key={step} className="group rounded-[2rem] border border-[#123632]/10 bg-[#fffdf8] p-6 shadow-[0_16px_50px_rgba(8,37,34,.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(8,37,34,.1)]">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4b6e68]">How it works</div>
                  <h2 className="mt-3 text-xl font-black tracking-tight text-[#082522]">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#55706c]">{text}</p>
                </div>
                <div className="text-4xl font-black tracking-[-0.05em] text-[#b9d7cd] transition group-hover:text-[#8aaea4]">{step}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#46706a]">Start where you are</div>
              <h2 className="mt-3 max-w-md text-4xl font-black leading-[.98] tracking-[-0.045em] text-[#082522] sm:text-5xl">
                You don&apos;t need to know the tour name.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#57706c] lg:justify-self-end">
              Alaska excursion shopping gets messy fast. Start with the thing you already know — your port, your ship, or the kind of experience you want — and use the site as a decision tool instead of a giant catalog.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <Link href="/ports" className="group relative min-h-[300px] overflow-hidden rounded-[2.25rem] bg-[#0a312e] p-7 text-white shadow-[0_20px_70px_rgba(8,37,34,.14)]">
              <Image
                src="/images/home/card-ports.webp"
                alt="First Alaska cruise"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                loading="lazy"
                className="object-cover -z-10 brightness-[0.7] transition duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full border border-[#d7ff76]/20 transition duration-500 group-hover:scale-110" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7ff76]">First Alaska cruise?</div>
                <div>
                  <h3 className="max-w-sm text-3xl font-black leading-none tracking-[-0.035em]">Start with the port.</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">See what each stop is best known for before you compare individual tours.</p>
                  <span className="mt-5 inline-flex text-sm font-black text-white">Compare ports →</span>
                </div>
              </div>
            </Link>

            <Link href="/ships" className="group relative min-h-[300px] overflow-hidden rounded-[2.25rem] bg-[#cfe7e2] p-7 text-[#082522] shadow-[0_20px_70px_rgba(8,37,34,.08)]">
              <Image
                src="/images/home/card-ships.webp"
                alt="Know your ship"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                loading="lazy"
                className="object-cover -z-10 brightness-[0.7] transition duration-500 group-hover:scale-105"
              />
              <div className="absolute right-6 top-5 text-8xl font-black leading-none text-white/35">02</div>
              <div className="relative flex h-full flex-col justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#426962]">Know your ship?</div>
                <div>
                  <h3 className="max-w-sm text-3xl font-black leading-none tracking-[-0.035em]">Start with the port window.</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#496762]">Put your cruise-day timing next to the choices you&apos;re considering.</p>
                  <span className="mt-5 inline-flex text-sm font-black">Browse ships →</span>
                </div>
              </div>
            </Link>

            <a href="#popular-searches" className="group relative min-h-[300px] overflow-hidden rounded-[2.25rem] bg-[#d7ff76] p-7 text-[#082522] shadow-[0_20px_70px_rgba(141,174,58,.15)]">
              <Image
                src="/images/home/card-experiences.webp"
                alt="Know the experience"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                loading="lazy"
                className="object-cover -z-10 brightness-[0.7] transition duration-500 group-hover:scale-105"
              />
              <div className="absolute -right-6 -top-8 text-[9rem] font-black leading-none text-[#082522]/7">03</div>
              <div className="relative flex h-full flex-col justify-between">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#456019]">Know the experience?</div>
                <div>
                  <h3 className="max-w-sm text-3xl font-black leading-none tracking-[-0.035em]">Go straight to it.</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#365030]">Whales, Mendenhall, helicopters, dog sledding, fishing, Misty Fjords and more.</p>
                  <span className="mt-5 inline-flex text-sm font-black">Popular searches ↓</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="experiences" className="relative overflow-hidden bg-[#082522] px-5 py-20 text-white sm:px-7 lg:px-10 lg:py-28">
        <div className="absolute -left-36 top-0 h-[420px] w-[420px] rounded-full border border-white/5" />
        <div className="absolute -left-20 top-16 h-[280px] w-[280px] rounded-full border border-[#d7ff76]/10" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#d7ff76]">Eight ways to shop Alaska</div>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[.96] tracking-[-0.045em] sm:text-6xl">What kind of Alaska day sounds like you?</h2>
            </div>
            <a href="#find-your-port-day" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-[#082522]">
              Use the finder
            </a>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {TRIP_STYLES.map((style, index) => (
              <Link key={style.title} href={style.href} className="group relative min-h-[240px] overflow-hidden bg-[#0a302c] p-6 transition hover:bg-[#0d3a35]">
                {style.image && (
                  <Image
                    src={style.image}
                    alt={style.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading="lazy"
                    className="object-cover -z-10 brightness-[0.55] transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{style.icon}</span>
                  <span className="text-[10px] font-black tracking-[0.18em] text-white/25">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-xl font-black tracking-tight text-white">{style.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{style.text}</p>
                <span className="mt-6 block text-xs font-black uppercase tracking-[0.13em] text-[#d7ff76] opacity-80 transition group-hover:translate-x-1 group-hover:opacity-100">Explore this vibe →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="popular-searches" className="scroll-mt-6 px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] bg-[#d7ff76] p-7 text-[#082522] shadow-[0_30px_80px_rgba(125,155,47,.13)] sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#48651d]">Popular Alaska searches</div>
              <h2 className="mt-3 text-4xl font-black leading-[.96] tracking-[-0.045em] sm:text-5xl">Already know what you want?</h2>
            </div>
            <div>
              <p className="max-w-2xl text-sm leading-6 text-[#3a522f]">Jump directly into the focused comparison pages for the excursion ideas travelers search for most.</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {POPULAR_SEARCHES.map(([label, href]) => (
                  <Link key={href} href={href} className="rounded-full border border-[#082522]/15 bg-[#f7ffd8]/60 px-4 py-2.5 text-sm font-black text-[#163d37] transition hover:-translate-y-0.5 hover:border-[#082522]/30 hover:bg-white">
                    {label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ports" className="px-5 py-14 sm:px-7 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#46706a]">Three ports. Three very different days.</div>
              <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.045em] text-[#082522] sm:text-5xl">Choose your Alaska stop.</h2>
            </div>
            <Link href="/ports" className="text-sm font-black text-[#2d5a54]">See all port guides →</Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {APPROVED_PORTS.map((port, index) => (
              <Link key={port.slug} href={`/ports/${port.slug}`} className={`group relative overflow-hidden rounded-[2.4rem] bg-[#082522] shadow-[0_22px_70px_rgba(8,37,34,.12)] ${index === 1 ? "lg:translate-y-8" : ""}`}>
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src={port.image}
                    alt={port.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    loading="lazy"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#041c1a] via-[#041c1a]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d7ff76]">Port 0{index + 1}</div>
                  <h3 className="mt-2 text-4xl font-black tracking-[-0.04em]">{port.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{port.description}</p>
                  <span className="mt-5 inline-flex text-sm font-black text-white">Explore {port.title} →</span>
                </div>
              </Link>
            ))}
          </div>

          <div
            id="port-decision-comparison"
            className="mt-14 lg:mt-24 rounded-[2.5rem] border border-[#123632]/12 bg-[#fffdf8] p-5 shadow-[0_24px_80px_rgba(8,37,34,.08)] sm:p-8 lg:p-12"
          >
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f2ee] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#163d37]">
                Multi-Port Itinerary Strategy
              </div>
              <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.035em] text-[#082522] sm:text-4xl">
                What Each Alaska Port Does Best (So You Don&apos;t Book the Same Tour Twice)
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#4f6965] sm:text-base sm:leading-7">
                Most Inside Passage cruises visit Juneau, Skagway, and Ketchikan on the same voyage. Assign each stop its strongest signature experience first so you don&apos;t accidentally book two similar boat rides or spend a glacier port on a generic town bus.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#123632]/10 bg-[#f7f4ec] p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#082522] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7ff76]">
                      Port 01 · Juneau
                    </span>
                    <span className="text-[11px] font-bold text-[#46706a]">Whales &amp; Icefield Capital</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-[#082522]">
                    Juneau: Whales, Mendenhall &amp; Glacier Helicopters
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs leading-5 text-[#274743] sm:text-sm sm:leading-6">
                    <li>
                      <strong className="font-black text-[#082522]">Humpback whale watching:</strong> Protected Auke Bay &amp; Favorite Channel feeding grounds with 100% sighting guarantees ($165–$195 standalone; $245–$295 Mendenhall combo).
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Mendenhall Glacier &amp; icefield helicopter landings:</strong> Walk to Nugget Falls ($45–$95 shuttle/tour) or fly onto Herbert, Norris, or Mendenhall Glacier ($409–$429 flat rate).
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Don&apos;t duplicate:</strong> Book your whale boat and glacier walk here; skip narrow-fjord wildlife cruises in Skagway.
                    </li>
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#123632]/10 pt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#4b6e68]">
                    1-Click Shortlists &amp; Guide
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Link
                      href="/plan?port=juneau&topic=wildlife-whales&sourcePage=/"
                      className="inline-flex items-center rounded-xl bg-[#082522] px-3 py-2 text-xs font-black text-[#d7ff76] transition hover:bg-[#143d38]"
                    >
                      Whale /plan shortlist →
                    </Link>
                    <Link
                      href="/plan?port=juneau&topic=glaciers&sourcePage=/"
                      className="inline-flex items-center rounded-xl border border-[#123632]/20 bg-white px-3 py-2 text-xs font-black text-[#082522] transition hover:bg-[#e8f2ee]"
                    >
                      Glacier &amp; heli /plan →
                    </Link>
                    <Link
                      href="/ports/juneau"
                      className="inline-flex items-center rounded-xl border border-[#123632]/15 bg-[#e8f2ee] px-3 py-2 text-xs font-black text-[#123632] transition hover:bg-[#d7ebe4]"
                    >
                      Juneau port guide →
                    </Link>
                  </div>
                </div>
              </article>

              <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#123632]/10 bg-[#f7f4ec] p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#082522] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7ff76]">
                      Port 02 · Skagway
                    </span>
                    <span className="text-[11px] font-bold text-[#46706a]">Rail, Summit &amp; Huskies</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-[#082522]">
                    Skagway: White Pass Rail, Klondike Summit &amp; Sled-Dog Camps
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs leading-5 text-[#274743] sm:text-sm sm:leading-6">
                    <li>
                      <strong className="font-black text-[#082522]">White Pass &amp; Yukon Route rail:</strong> Historic narrow-gauge mountain railway climbing nearly 3,000 feet above the 1898 Trail of &apos;98 canyon.
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Klondike summit &amp; sled-dog camps:</strong> Combine White Pass summit overlooks and Liarsville Gold Rush camp ($65–$95) with Dyea wheeled husky camps ($140–$180) or the $599 Denver Glacier helicopter dogsledding demonstration (guests observe the demonstration only—no sled riding).
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Don&apos;t duplicate:</strong> Save marine wildlife boats for Juneau; use Skagway for alpine passes, Gold Rush history, and sled dogs.
                    </li>
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#123632]/10 pt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#4b6e68]">
                    1-Click Shortlists &amp; Guide
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Link
                      href="/plan?port=skagway&topic=best-overall&sourcePage=/"
                      className="inline-flex items-center rounded-xl bg-[#082522] px-3 py-2 text-xs font-black text-[#d7ff76] transition hover:bg-[#143d38]"
                    >
                      Skagway /plan shortlist →
                    </Link>
                    <Link
                      href="/plan?port=skagway&topic=dog-sledding&sourcePage=/"
                      className="inline-flex items-center rounded-xl border border-[#123632]/20 bg-white px-3 py-2 text-xs font-black text-[#082522] transition hover:bg-[#e8f2ee]"
                    >
                      Sled-dog /plan →
                    </Link>
                    <Link
                      href="/ports/skagway"
                      className="inline-flex items-center rounded-xl border border-[#123632]/15 bg-[#e8f2ee] px-3 py-2 text-xs font-black text-[#123632] transition hover:bg-[#d7ebe4]"
                    >
                      Skagway port guide →
                    </Link>
                  </div>
                </div>
              </article>

              <article className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#123632]/10 bg-[#f7f4ec] p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#082522] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#d7ff76]">
                      Port 03 · Ketchikan
                    </span>
                    <span className="text-[11px] font-bold text-[#46706a]">Fjord Floatplanes &amp; Totems</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black tracking-tight text-[#082522]">
                    Ketchikan: Misty Fjords Floatplanes, Crab Boat &amp; Totem Parks
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-xs leading-5 text-[#274743] sm:text-sm sm:leading-6">
                    <li>
                      <strong className="font-black text-[#082522]">Misty Fjords floatplanes:</strong> Bush seaplane flights over 3,000-foot granite cliffs with an alpine lake or fjord pontoon landing ($330–$395, 1.5–2h).
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Bering Sea crab boat &amp; totem parks:</strong> Live King crab &amp; eagle deck shows, Herring Cove black bear platforms ($120–$180), plus Saxman Native Village &amp; Totem Bight carved poles.
                    </li>
                    <li>
                      <strong className="font-black text-[#082522]">Don&apos;t duplicate:</strong> Ketchikan has no roadside glaciers—save ice walks for Juneau/Skagway and book seaplanes, crab boats, bears, or totems here.
                    </li>
                  </ul>
                </div>
                <div className="mt-6 border-t border-[#123632]/10 pt-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#4b6e68]">
                    1-Click Shortlists &amp; Guide
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Link
                      href="/plan?port=ketchikan&topic=flightseeing&sourcePage=/"
                      className="inline-flex items-center rounded-xl bg-[#082522] px-3 py-2 text-xs font-black text-[#d7ff76] transition hover:bg-[#143d38]"
                    >
                      Misty Fjords /plan →
                    </Link>
                    <Link
                      href="/plan?port=ketchikan&topic=wildlife-whales&sourcePage=/"
                      className="inline-flex items-center rounded-xl border border-[#123632]/20 bg-white px-3 py-2 text-xs font-black text-[#082522] transition hover:bg-[#e8f2ee]"
                    >
                      Wildlife /plan shortlist →
                    </Link>
                    <Link
                      href="/ports/ketchikan"
                      className="inline-flex items-center rounded-xl border border-[#123632]/15 bg-[#e8f2ee] px-3 py-2 text-xs font-black text-[#123632] transition hover:bg-[#d7ebe4]"
                    >
                      Ketchikan port guide →
                    </Link>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#123632]/12 bg-white">
              <table className="w-full border-collapse text-left text-xs sm:text-sm">
                <caption className="sr-only">
                  Side-by-side comparison of what Juneau, Skagway, and Ketchikan do best for multi-port Alaska cruise visitors
                </caption>
                <thead className="sr-only md:not-sr-only md:border-b md:border-[#123632]/10 md:bg-[#082522] md:text-[11px] md:font-black md:uppercase md:tracking-[0.16em] md:text-[#d7ff76]">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">Port &amp; Best Role</th>
                    <th scope="col" className="px-5 py-3.5">Signature #1 &amp; #2 to Book Here</th>
                    <th scope="col" className="px-5 py-3.5">Skip Here / Save for Another Port</th>
                    <th scope="col" className="px-5 py-3.5">Dock Logistics &amp; Buffer</th>
                    <th scope="col" className="px-5 py-3.5">Direct Action Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#123632]/10">
                  <tr className="block p-4 md:table-row md:p-0">
                    <th scope="row" className="block font-black text-[#082522] md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="text-base md:text-sm">Juneau</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#46706a]">Whales &amp; Glacier Ice</span>
                    </th>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Book Here:</span>
                      Auke Bay humpback whale watching ($165–$195), Mendenhall Glacier combos ($245–$295), and Juneau Icefield helicopter glacier landings ($409–$429).
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Avoid Duplicating:</span>
                      Skip generic town trolleys—save historic rail for Skagway and totem parks or bush floatplanes for Ketchikan.
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Dock &amp; Buffer:</span>
                      Mt. Roberts Tram Plaza pickup (AJ Dock uses 5-min shuttle). Keep a 45–60 min all-aboard buffer.
                    </td>
                    <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <div className="flex flex-wrap gap-2">
                        <Link href="/plan?port=juneau&topic=best-overall&sourcePage=/" className="font-black text-[#082522] underline decoration-[#8ebc3d] decoration-2 underline-offset-4 hover:text-[#2d5a54]">
                          Juneau /plan shortlist
                        </Link>
                        <span className="text-[#123632]/30">·</span>
                        <Link href="/ports/juneau" className="font-bold text-[#2d5a54] hover:underline">
                          /ports/juneau
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="block bg-[#faf7f0] p-4 md:table-row md:p-0">
                    <th scope="row" className="block font-black text-[#082522] md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="text-base md:text-sm">Skagway</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#46706a]">Rail, Summit &amp; Sled Dogs</span>
                    </th>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Book Here:</span>
                      White Pass &amp; Yukon Route narrow-gauge rail, Klondike summit &amp; 1898 Gold Rush camps ($65–$120), plus Dyea wheeled sled-dog camps ($140–$180) or the $599 Denver Glacier helicopter dogsledding demonstration (observation only, no riding).
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Avoid Duplicating:</span>
                      Don&apos;t book whale watching in upper Lynn Canal—do whales in Juneau and keep Skagway for mountain rail, summit overlooks, and huskies.
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Dock &amp; Buffer:</span>
                      5–15 min flat walk from Ore/Broadway Docks (shuttle at Railroad Dock). Keep 45+ min return cushion.
                    </td>
                    <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <div className="flex flex-wrap gap-2">
                        <Link href="/plan?port=skagway&topic=best-overall&sourcePage=/" className="font-black text-[#082522] underline decoration-[#8ebc3d] decoration-2 underline-offset-4 hover:text-[#2d5a54]">
                          Skagway /plan shortlist
                        </Link>
                        <span className="text-[#123632]/30">·</span>
                        <Link href="/ports/skagway" className="font-bold text-[#2d5a54] hover:underline">
                          /ports/skagway
                        </Link>
                      </div>
                    </td>
                  </tr>

                  <tr className="block p-4 md:table-row md:p-0">
                    <th scope="row" className="block font-black text-[#082522] md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="text-base md:text-sm">Ketchikan</span>
                      <span className="mt-0.5 block text-[11px] font-bold text-[#46706a]">Floatplanes, Crab &amp; Totems</span>
                    </th>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Book Here:</span>
                      Misty Fjords floatplanes with water landing ($330–$395), Bering Sea crab boat &amp; Herring Cove black bears ($120–$215), and Saxman / Totem Bight totem parks.
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Avoid Duplicating:</span>
                      No roadside glaciers in Ketchikan—save glacier ice walks for Juneau/Skagway and prioritize floatplanes, crab boats, bears, and totems here.
                    </td>
                    <td className="mt-2 block text-[#274743] md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#4b6e68] md:hidden">Dock &amp; Buffer:</span>
                      Berths 1–4 step right downtown (45–60 min buffer); Ward Cove is 9 mi north via 20-min shuttle (allow 90-min buffer).
                    </td>
                    <td className="mt-3 block md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
                      <div className="flex flex-wrap gap-2">
                        <Link href="/plan?port=ketchikan&topic=best-overall&sourcePage=/" className="font-black text-[#082522] underline decoration-[#8ebc3d] decoration-2 underline-offset-4 hover:text-[#2d5a54]">
                          Ketchikan /plan shortlist
                        </Link>
                        <span className="text-[#123632]/30">·</span>
                        <Link href="/ports/ketchikan" className="font-bold text-[#2d5a54] hover:underline">
                          /ports/ketchikan
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[2.75rem] border border-[#123632]/10 bg-[#fffdf8] p-7 shadow-[0_24px_80px_rgba(8,37,34,.07)] sm:p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#46706a]">Know your ship already?</div>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[.98] tracking-[-0.045em] text-[#082522] sm:text-5xl">Use your port window as another filter.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#57706c]">Ship timing is planning guidance only. Always confirm the cruise line&apos;s actual all-aboard time and the operator&apos;s meeting instructions.</p>
            </div>
            <Link href="/ships" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#082522] px-7 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-[#16443f]">Browse ships</Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-7 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#46706a]">Alaska shore excursion FAQ</div>
            <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-black leading-[.98] tracking-[-0.045em] text-[#082522] sm:text-5xl">The questions people ask before they book.</h2>
          </div>
          <div className="mt-10 divide-y divide-[#123632]/10 border-y border-[#123632]/10">
            {HOME_FAQS.map((faq, index) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left marker:content-none">
                  <span className="flex gap-4 text-lg font-black tracking-tight text-[#082522] sm:text-xl">
                    <span className="pt-1 text-[10px] font-black tracking-[0.16em] text-[#81a29a]">0{index + 1}</span>
                    {faq.question}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#123632]/15 text-lg transition group-open:rotate-45">+</span>
                </summary>
                <p className="ml-9 mt-4 max-w-3xl text-sm leading-7 text-[#57706c]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 pt-10 sm:px-7 lg:px-10 lg:pb-14">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-[#082522] px-7 py-14 text-white shadow-[0_28px_90px_rgba(8,37,34,.2)] sm:px-10 lg:px-14 lg:py-20">
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/images/home/cta-scenery.webp"
              alt="Juneau Alaska scenery"
              fill
              sizes="100vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,29,27,.96),rgba(4,29,27,.72),rgba(4,29,27,.34))]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.23em] text-[#d7ff76]">Need a human?</div>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-[.96] tracking-[-0.045em] sm:text-6xl">Not sure which Alaska day to choose?</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">Use the finder first, or contact us when you want help narrowing the options around your port, interests and cruise-day timing.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a href="tel:+19077238908" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#d7ff76] px-6 text-xs font-black uppercase tracking-[0.13em] text-[#082522] transition hover:bg-white">Call 907-723-8908</a>
              <Link href="/contact-us" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-xs font-black uppercase tracking-[0.13em] text-white backdrop-blur transition hover:bg-white hover:text-[#082522]">Contact us</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 sm:px-7 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#123632]/10 pt-6 text-xs font-bold text-[#6b817d] sm:flex-row sm:items-center sm:justify-between">
          <span>Welcome to Alaska Tours</span>
          <span>Juneau · Skagway · Ketchikan</span>
        </div>
      </footer>
    </main>
  );
}
