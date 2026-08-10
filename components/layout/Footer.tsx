export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              © 2026 Welcome To Alaska Tours
            </p>
            <a
              href="tel:+19077238908"
              className="mt-2 inline-flex text-sm font-black text-slate-700 transition hover:text-sky-700"
            >
              907-723-8908
            </a>
          </div>
          <div className="text-[10px] text-slate-300 uppercase tracking-tighter text-center md:text-right">
            Imagery provided by <a href="https://unsplash.com" className="underline">Unsplash</a>.
            {" "}Secure checkout powered by Stripe.
          </div>
        </div>
      </div>
    </footer>
  );
}
