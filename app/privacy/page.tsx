import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Welcome To Alaska Tours",
  description: "Privacy information for Welcome To Alaska Tours, including booking, contact, analytics, and payment data handling.",
  alternates: { canonical: "https://welcometoalaskatours.com/privacy" },
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
          <section><h2 className="font-black text-slate-950">Questions or requests</h2><p className="mt-2">For privacy questions, call <a className="font-bold text-sky-800" href="tel:+19077238908">907-723-8908</a> or use our <Link className="font-bold text-sky-800" href="/contact-us">contact page</Link>.</p></section>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6"><Link href="/" className="text-sm font-black text-sky-800">← Back to Alaska tours</Link></div>
      </article>
    </main>
  );
}
