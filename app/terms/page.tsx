export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-slate-900">
      <h1 className="text-4xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-sm text-slate-600">Effective date: March 10, 2026</p>

      <section className="mt-10 space-y-4 text-sm leading-6 text-slate-700">
        <p>
          By using Welcome To Alaska Tours, you agree to these terms. We provide booking and planning tools connecting travelers
          with independent tour operators.
        </p>
        <p>
          Tour availability, operating conditions, and cancellation terms are set by each operator. Final booking confirmation
          depends on successful payment and operator acceptance.
        </p>
        <p>
          Prices and schedules may change without notice. We make reasonable efforts to keep availability and pricing current.
        </p>
        <p>
          Payments are processed through Stripe. Refunds and changes are subject to the applicable operator and payment platform
          policies.
        </p>
        <p>
          Travelers are responsible for arriving on time, meeting operator requirements, and verifying cruise-day logistics.
          Always review operator instructions provided after booking.
        </p>
        <p>
          For support regarding bookings, changes, or issues, contact
          {" "}
          <a className="font-semibold text-sky-700 hover:underline" href="mailto:support@welcometoalaskatours.com">support@welcometoalaskatours.com</a>.
        </p>
      </section>
    </main>
  );
}
