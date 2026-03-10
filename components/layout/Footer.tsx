import Link from "next/link";
import NewsletterSignup from "@/app/components/newsletter/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <NewsletterSignup
          source="footer"
          compact
          title="Get Alaska News, Tips, and Tour Updates"
          description="Value-first updates for cruise travelers. Unsubscribe anytime."
          className="mb-6"
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
          © 2026 Welcome To Alaska Tours
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-500">
          <Link href="/tours" className="hover:text-slate-800">Tours</Link>
          <Link href="/guides" className="hover:text-slate-800">Guides</Link>
          <Link href="/about" className="hover:text-slate-800">About</Link>
          <Link href="/contact-us" className="hover:text-slate-800">Contact</Link>
          <Link href="/privacy" className="hover:text-slate-800">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-800">Terms</Link>
        </div>
        <div className="text-[10px] text-slate-300 uppercase tracking-tighter text-center md:text-right">
          Imagery provided by <a href="https://unsplash.com" className="underline">Unsplash</a>.
          {" "}All bookings subject to our Back-to-Ship Guarantee.
        </div>
        </div>
      </div>
    </footer>
  );
}
