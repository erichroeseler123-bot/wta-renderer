export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-slate-900">
      <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-slate-600">Effective date: March 10, 2026</p>

      <section className="mt-10 space-y-4 text-sm leading-6 text-slate-700">
        <p>
          Welcome To Alaska Tours collects limited personal information needed to search, book, and manage tour reservations.
          This includes traveler name, email, phone number, and booking metadata such as selected departures and party size.
        </p>
        <p>
          Payment details are processed by Stripe. We do not store full card numbers or card security codes on this website.
          Stripe may send receipt emails and retain payment records according to their policies.
        </p>
        <p>
          To fulfill bookings, we share required traveler details with tour operators and booking providers such as FareHarbor.
          This allows reservation creation, confirmation delivery, and support handling.
        </p>
        <p>
          We use service logs and analytics data to improve reliability, detect fraud, and troubleshoot booking issues.
          We do not sell personal information.
        </p>
        <p>
          If you need to update or delete booking-related personal data, contact
          {" "}
          <a className="font-semibold text-sky-700 hover:underline" href="mailto:support@welcometoalaskatours.com">support@welcometoalaskatours.com</a>.
        </p>
      </section>
    </main>
  );
}
