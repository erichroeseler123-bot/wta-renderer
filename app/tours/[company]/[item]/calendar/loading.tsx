export default function CalendarLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f7fb_0%,#eef6f6_45%,#f8fafc_100%)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="animate-pulse rounded-[2rem] border border-sky-100 bg-white/90 p-6 shadow-sm">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="mt-4 h-8 w-56 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-80 rounded bg-slate-200" />
        </div>

        <div className="mt-6 animate-pulse rounded-[2rem] border border-sky-100 bg-white/95 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-10 w-32 rounded-xl bg-slate-200" />
            <div className="h-10 w-44 rounded-full bg-slate-300" />
            <div className="h-10 w-28 rounded-xl bg-slate-200" />
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
