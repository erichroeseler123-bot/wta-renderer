import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Welcome To Alaska Tours",
  description:
    "Contact Welcome To Alaska Tours for help comparing cruise shore excursions in Juneau, Skagway, and Ketchikan. Call 907-723-8908 or email hello@welcometoalaskatours.com.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Contact</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Need help with your Alaska port day?
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          We can help you navigate the site, compare tour options, and find the live booking calendar for excursions in Juneau, Skagway, and Ketchikan.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a href="tel:+19077238908" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 transition hover:bg-cyan-300/15">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-300">Call</div>
            <div className="mt-2 text-2xl font-black text-white">907-723-8908</div>
            <div className="mt-1 text-sm text-slate-400">Tap to call from your phone.</div>
          </a>
          <a href="mailto:hello@welcometoalaskatours.com" className="rounded-2xl border border-white/10 bg-black/10 p-5 transition hover:bg-white/[0.06]">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-300">Email</div>
            <div className="mt-2 break-all text-lg font-black text-white">hello@welcometoalaskatours.com</div>
            <div className="mt-1 text-sm text-slate-400">Include your ship, port, and visit date when possible.</div>
          </a>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-lg font-black text-white">Booking help</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            For current tour dates, departure times, prices, and remaining capacity, use the live calendar on the individual tour page. Operator policies and meeting instructions should be reviewed before completing checkout.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tours" className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 hover:bg-slate-100">Browse tours</Link>
            <Link href="/ports" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-black text-white hover:bg-white/10">Browse ports</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
