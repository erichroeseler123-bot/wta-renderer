export default function TourLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef6f6_45%,#f8fafc_100%)]">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="animate-pulse rounded-[2rem] border border-sky-100 bg-white/90 p-4 shadow-sm">
          <div className="aspect-[4/3] rounded-3xl bg-slate-200" />
          <div className="mt-4 h-4 w-24 rounded bg-slate-200" />
          <div className="mt-3 h-8 w-2/3 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full rounded bg-slate-200" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
          <div className="mt-6 h-12 w-full rounded-2xl bg-slate-300" />
        </div>
      </div>
    </main>
  );
}
