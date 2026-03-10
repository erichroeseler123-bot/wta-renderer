export default function ContactUsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-slate-900">
      <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
      <p className="mt-4 text-lg text-slate-700">
        Questions about ports, timing, accessibility, or a specific tour? Reach out and we will help you plan the best fit.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Support</h2>
          <p className="mt-3 text-sm text-slate-600">
            Email: <a className="font-semibold text-sky-700 hover:underline" href="mailto:support@welcometoalaskatours.com">support@welcometoalaskatours.com</a>
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Phone: <a className="font-semibold text-sky-700 hover:underline" href="tel:+18005550111">+1 (800) 555-0111</a>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Typical response time: within 1 business day.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Before You Contact Us</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Have your cruise ship name and port date ready.</li>
            <li>Include group size and any mobility needs.</li>
            <li>If already booked, include your order or confirmation ID.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
