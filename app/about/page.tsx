import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20 text-slate-900">
      <h1 className="text-4xl font-extrabold tracking-tight">About Welcome To Alaska Tours</h1>
      <p className="mt-6 text-lg text-slate-700">
        Welcome To Alaska Tours helps cruise travelers quickly find shore excursions that fit real port timing,
        group size, and departure windows. We focus on practical planning and clear booking so your day ashore is smooth.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black uppercase tracking-wide text-sky-700">Cruise-first planning</div>
          <p className="mt-2 text-sm text-slate-600">We prioritize excursions that work within ship arrival and return windows.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black uppercase tracking-wide text-sky-700">Live availability</div>
          <p className="mt-2 text-sm text-slate-600">Departures and pricing are checked in real time before payment.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black uppercase tracking-wide text-sky-700">Secure booking</div>
          <p className="mt-2 text-sm text-slate-600">Checkout is encrypted and confirmation status is shown immediately after payment.</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
          href="/tours"
        >
          Browse Tours
        </Link>
        <Link
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          href="/contact-us"
        >
          Contact Our Team
        </Link>
      </div>
    </main>
  );
}
