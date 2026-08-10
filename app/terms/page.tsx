import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Welcome To Alaska Tours",
  description: "Terms for using Welcome To Alaska Tours and booking independently operated Alaska excursions.",
  alternates: { canonical: "https://welcometoalaskatours.com/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Welcome To Alaska Tours</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Terms of Use</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Welcome To Alaska Tours helps travelers compare and access independently operated Alaska excursions. These terms describe the role of this website and the responsibilities that remain with the traveler and tour operator.</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section><h2 className="font-black text-slate-950">Independent operators</h2><p className="mt-2">Tours and activities are provided by independent operators. Operator-specific descriptions, schedules, restrictions, meeting instructions, cancellation rules, and safety requirements apply to the excursion you select.</p></section>
          <section><h2 className="font-black text-slate-950">Availability, prices, and schedules</h2><p className="mt-2">Availability, pricing, departure times, capacity, and itinerary details can change. The live booking calendar and the operator's confirmation are the controlling sources for a reservation.</p></section>
          <section><h2 className="font-black text-slate-950">Cruise-day timing</h2><p className="mt-2">Port timing tools and guides are planning aids, not guarantees. Travelers are responsible for confirming their ship's current berth, arrival, departure, and all-aboard instructions and for allowing sufficient time to reach meeting points and return to the ship.</p></section>
          <section><h2 className="font-black text-slate-950">Payments, cancellations, and refunds</h2><p className="mt-2">Payment and reservation processing may involve Stripe, FareHarbor, or the applicable operator. Cancellation, refund, weather, and no-show rules depend on the terms shown for the specific booking.</p></section>
          <section><h2 className="font-black text-slate-950">Site information</h2><p className="mt-2">We work to keep information accurate and useful, but port operations, weather, transportation conditions, and operator details can change. Verify time-sensitive information before relying on it.</p></section>
          <section><h2 className="font-black text-slate-950">Contact</h2><p className="mt-2">Questions about the site can be directed to <a className="font-bold text-sky-800" href="tel:+19077238908">907-723-8908</a> or through our <Link className="font-bold text-sky-800" href="/contact-us">contact page</Link>.</p></section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6"><Link href="/" className="text-sm font-black text-sky-800">← Back to Alaska tours</Link></div>
      </article>
    </main>
  );
}
