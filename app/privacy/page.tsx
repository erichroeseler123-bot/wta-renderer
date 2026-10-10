import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Welcome To Alaska Tours",
  description: "Privacy information for Welcome To Alaska Tours, including booking, contact, analytics, and payment data handling.",
  alternates: { canonical: "https://www.welcometoalaskatours.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Welcome To Alaska Tours</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">We collect only the information reasonably needed to help visitors browse, contact us, and complete or support excursion bookings.</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-slate-700">
          <section><h2 className="font-black text-slate-950">Information you provide</h2><p className="mt-2">This may include your name, email address, phone number, cruise or port details, passenger information, and information entered during checkout or customer support.</p></section>
          <section><h2 className="font-black text-slate-950">Payments and booking partners</h2><p className="mt-2">Payment information may be processed by payment providers such as Stripe. Excursion availability and reservations may involve FareHarbor or the applicable tour operator. Those providers handle information under their own privacy practices as well.</p></section>
          <section><h2 className="font-black text-slate-950">Site measurement</h2><p className="mt-2">We may record basic site-use and conversion-intent information, such as pages visited, booking-link clicks, and phone-link clicks, to understand which parts of the site are useful and to improve the customer experience.</p></section>
          <section><h2 className="font-black text-slate-950">How we use information</h2><p className="mt-2">We use information to provide requested services, support bookings, respond to questions, operate and secure the site, improve the shopping experience, and meet legal or operational requirements.</p></section>
          <section><h2 className="font-black text-slate-950">Data retention procedures</h2><p className="mt-2">Customer service and reservation records are retained for the duration of the relevant cruise season and up to 24 months thereafter to support booking confirmations, operator reconciliations, customer service follow-ups, and accounting compliance. Aggregated, non-identifying analytics data is retained for up to 14 months to evaluate seasonal website performance.</p></section>
          <section><h2 className="font-black text-slate-950">Data access and deletion requests</h2><p className="mt-2">Travelers may request access to, correction of, or permanent deletion of their personal information at any time. To request data deletion, contact us by phone at <a className="font-bold text-sky-800" href="tel:+19077238908">907-723-8908</a> or submit a written request via our <Link className="font-bold text-sky-800" href="/contact-us">contact page</Link>. We review and process verified deletion requests within 30 business days, retaining only records required by federal or state tax and accounting laws.</p></section>
          <section><h2 className="font-black text-slate-950">No sale of personal data</h2><p className="mt-2">We do not sell, rent, or monetize your personal information to third-party data brokers or advertising networks. Your information is shared exclusively with the operating tour partner and secure booking technology providers (FareHarbor and Stripe) necessary to fulfill your excursion reservation.</p></section>
          <section><h2 className="font-black text-slate-950">Questions or requests</h2><p className="mt-2">For privacy questions or data requests, call <a className="font-bold text-sky-800" href="tel:+19077238908">907-723-8908</a> or use our <Link className="font-bold text-sky-800" href="/contact-us">contact page</Link>.</p></section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6"><Link href="/" className="text-sm font-black text-sky-800">← Back to Alaska tours</Link></div>
      </article>
    </main>
  );
}
