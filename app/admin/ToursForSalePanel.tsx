"use client";

import { useMemo, useState } from "react";
import type { Provider } from "./useAdminData";

export default function ToursForSalePanel(props: {
  providers: Provider[];
  onProviderHidden: (company: string, hidden: boolean) => void;
  onTourHidden: (key: string, hidden: boolean) => void;
  onHideAll: (company: string, hideAll: boolean) => void;
}) {
  const { providers, onProviderHidden, onTourHidden, onHideAll } = props;

  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const totals = useMemo(() => ({
    providers: providers.length,
    tours: providers.reduce((n, p) => n + p.tours.length, 0),
  }), [providers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return providers;

    return providers
      .map((p) => {
        const providerMatch =
          p.company.toLowerCase().includes(term) ||
          (p.companyName || "").toLowerCase().includes(term);

        if (providerMatch) return p;

        const tours = p.tours.filter((t) =>
          (t.itemName || "").toLowerCase().includes(term)
        );
        return { ...p, tours };
      })
      .filter((p) => p.tours.length > 0);
  }, [providers, q]);

  function expandAll() {
    const next: Record<string, boolean> = {};
    for (const p of filtered) next[p.company] = true;
    setOpen(next);
  }

  function collapseAll() {
    setOpen({});
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-0 overflow-hidden">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#05070d]/90 backdrop-blur p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/70">Tours for sale</div>
            <div className="text-lg font-semibold">
              Providers: {totals.providers} • Tours: {totals.tours}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
            >
              Expand all
            </button>
            <button
              onClick={collapseAll}
              className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm"
            >
              Collapse all
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search provider or tour…"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filtered.map((p) => {
          const isOpen = open[p.company] ?? false;
          const providerVisible = p.hidden ? false : true;

          const visibleCount = p.tours.reduce((n, t) => n + (t.hidden ? 0 : 1), 0);
          const hiddenCount = p.tours.length - visibleCount;

          return (
            <div key={p.company} className="rounded-2xl border border-white/10 bg-black/20">
              <div className="flex items-center justify-between gap-3 p-3">
                <button
                  onClick={() => setOpen((o) => ({ ...o, [p.company]: !isOpen }))}
                  className="flex-1 text-left"
                  title="Expand"
                >
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {p.companyName ? `${p.companyName} ` : ""}
                      <span className="text-white/60">({p.company})</span>
                    </div>

                    <span className="text-xs rounded-full bg-white/10 px-2 py-0.5 text-white/70">
                      {visibleCount} visible
                    </span>
                    {hiddenCount ? (
                      <span className="text-xs rounded-full bg-white/10 px-2 py-0.5 text-white/70">
                        {hiddenCount} hidden
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-0.5 text-xs text-white/50">{p.tours.length} tours</div>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onProviderHidden(p.company, providerVisible)}
                    className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
                    title="Hide/show provider"
                  >
                    {providerVisible ? "Hide provider" : "Show provider"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onHideAll(p.company, providerVisible)}
                    className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
                    title="Hide/show provider AND all tours under it"
                  >
                    {providerVisible ? "Hide all" : "Show all"}
                  </button>
                </div>
              </div>

              {isOpen ? (
                <div className="border-t border-white/10 p-3">
                  <div className="space-y-2">
                    {p.tours.map((t) => {
                      const tourVisible = t.hidden ? false : true;
                      return (
                        <div
                          key={t.key}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{t.itemName}</div>
                            <div className="text-xs text-white/50 truncate">{t.key}</div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onTourHidden(t.key, tourVisible)}
                            className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs whitespace-nowrap"
                            title="Toggle visibility"
                          >
                            {tourVisible ? "Hide" : "Show"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
