"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { useCruise } from "@/context/CruiseContext";
import { useCart } from "@/app/components/cart/CartContext";
import { CRUISE_ITINERARY_HINTS, CRUISE_SHIPS } from "@/lib/cruiseShips";

type Tour = {
  pk: number;
  title: string;
  slug?: string;
  description?: string;
  image?: string;
  company: string;
  fromPrice?: string;
  category?: string;
};

type MatchState = {
  status: "checking" | "match" | "no_match" | "error";
  firstStartAt?: string;
};

const SHIP_OPTIONS = CRUISE_SHIPS;

function normalize(s: string) {
  return String(s || "").trim().toLowerCase();
}

function matchCategory(input: string, categories: string[]) {
  const n = normalize(input);
  if (!n) return "";

  const exact = categories.find((c) => normalize(c) === n);
  if (exact) return exact;

  const deSlug = n.replace(/-/g, " ");
  const loose = categories.find((c) => normalize(c).replace(/-/g, " ") === deSlug);
  return loose || "";
}

function timeLabel(startAt?: string) {
  if (!startAt) return "";
  try {
    return new Date(startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ToursPage() {
  const { ship, date: savedDate, loaded, setCruise, clearCruise } = useCruise();
  const { items } = useCart();

  const [tours, setTours] = useState<Tour[]>([]);
  const [manualCat, setManualCat] = useState<string | null>(null);
  const [loadingTours, setLoadingTours] = useState(true);
  const [fitScheduleOnly, setFitScheduleOnly] = useState(true);
  const [shipInput, setShipInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [planInitialized, setPlanInitialized] = useState(false);
  const [matchMap, setMatchMap] = useState<Record<string, MatchState>>({});
  const [fitLoading, setFitLoading] = useState(false);
  const [fitChecked, setFitChecked] = useState(0);
  const fitCacheRef = useRef<Map<string, Record<string, MatchState>>>(new Map());
  const [queryParams, setQueryParams] = useState({
    portFilter: "",
    categoryFilterRaw: "",
    handoffId: "",
    party: "",
    date: "",
  });

  const { portFilter, categoryFilterRaw, handoffId, party, date } = queryParams;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setQueryParams({
      portFilter: normalize(sp.get("port") || ""),
      categoryFilterRaw: sp.get("category") || "",
      handoffId: sp.get("handoff_id") || sp.get("handoffId") || "",
      party: sp.get("partySize") || sp.get("party") || "",
      date: sp.get("date") || sp.get("cruiseDate") || "",
    });
  }, []);

  useEffect(() => {
    if (!loaded || planInitialized) return;
    const d = savedDate || date || "";
    setShipInput(ship || "");
    setDateInput(d);
    setFitScheduleOnly(Boolean(ship && d));
    setPlanInitialized(true);
  }, [loaded, planInitialized, ship, savedDate, date]);

  useEffect(() => {
    fetch("/data/tours.json")
      .then((r) => r.json())
      .then((d) => {
        setTours(Array.isArray(d) ? d : []);
        setLoadingTours(false);
      })
      .catch(() => {
        setTours([]);
        setLoadingTours(false);
      });
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(tours.map((t) => t.category || "Adventures"))],
    [tours],
  );

  const queryCategory = useMemo(
    () => matchCategory(categoryFilterRaw, categories),
    [categoryFilterRaw, categories],
  );
  const activeCat = manualCat ?? (queryCategory || "All");

  const filteredByQuery = useMemo(() => {
    return tours.filter((t) => {
      const tPort = inferPortFromCompany(t.company);
      if (portFilter && tPort !== portFilter) return false;
      if (activeCat !== "All" && (t.category || "Adventures") !== activeCat) return false;
      return true;
    });
  }, [tours, portFilter, activeCat]);

  const effectiveDate = dateInput || date || "";
  const profileComplete = Boolean(shipInput && effectiveDate);
  const itineraryHint = CRUISE_ITINERARY_HINTS[shipInput as keyof typeof CRUISE_ITINERARY_HINTS];
  const itineraryPort = normalize(itineraryHint?.portSlug || "");
  const dateKeyFor = useCallback(
    (t: Tour) => `${t.company}:${t.pk}:${effectiveDate}`,
    [effectiveDate],
  );

  const filteredByPortWindow = useMemo(() => {
    if (!(fitScheduleOnly && profileComplete && itineraryPort)) return filteredByQuery;
    return filteredByQuery.filter((t) => inferPortFromCompany(t.company) === itineraryPort);
  }, [fitScheduleOnly, profileComplete, itineraryPort, filteredByQuery]);

  useEffect(() => {
    if (!(fitScheduleOnly && profileComplete)) return;
    if (filteredByPortWindow.length < 1) return;
    const port = itineraryPort || portFilter || "";
    const category = activeCat !== "All" ? activeCat : "";
    const requestKey = `${effectiveDate}|${port}|${normalize(category)}`;
    const cached = fitCacheRef.current.get(requestKey);
    if (cached) {
      setMatchMap(cached);
      setFitChecked(Object.keys(cached).length);
      return;
    }

    let cancelled = false;
    setFitLoading(true);
    setFitChecked(0);
    setMatchMap({});

    async function run() {
      try {
        const qs = new URLSearchParams({
          date: effectiveDate,
          port,
          limit: "48",
        });
        if (category) qs.set("category", category);
        const res = await fetch(`/api/tours/fit?${qs.toString()}`, { cache: "no-store" });
        const j = await res.json().catch(() => null);
        const states = (j?.states && typeof j.states === "object") ? (j.states as Record<string, MatchState>) : {};
        if (cancelled) return;
        fitCacheRef.current.set(requestKey, states);
        setMatchMap(states);
        setFitChecked(Number(j?.checked || Object.keys(states).length || 0));
      } catch {
        if (cancelled) return;
        setMatchMap({});
      } finally {
        if (!cancelled) setFitLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [fitScheduleOnly, profileComplete, filteredByPortWindow.length, effectiveDate, itineraryPort, portFilter, activeCat]);

  const filtered = useMemo(() => {
    if (!(fitScheduleOnly && profileComplete)) return filteredByQuery;
    return filteredByPortWindow.filter((t) => matchMap[dateKeyFor(t)]?.status === "match");
  }, [fitScheduleOnly, profileComplete, filteredByQuery, filteredByPortWindow, matchMap, dateKeyFor]);

  const heading = portFilter ? `${portFilter[0].toUpperCase()}${portFilter.slice(1)} Shore Excursions` : "Alaska Shore Excursions";

  const plannedForDate = useMemo(() => {
    if (!effectiveDate) return [];
    return items
      .filter((it) => (it.day || it.handoffDate || "").slice(0, 10) === effectiveDate)
      .sort((a, b) => String(a.startAt || "").localeCompare(String(b.startAt || "")));
  }, [items, effectiveDate]);

  if (!loaded || loadingTours) {
    return <div className="p-20 text-center text-4xl font-black text-slate-500">Loading Your Tour Matches...</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-8 py-20">
        <header className="mb-16">
          <h1 className="mb-4 text-6xl font-black uppercase tracking-tighter text-slate-900">{heading}</h1>

          {(handoffId || date || party) ? (
            <div className="mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-wide">
              {handoffId ? <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">DCC Handoff</span> : null}
              {date ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Date {date}</span> : null}
              {party ? <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Party {party}</span> : null}
            </div>
          ) : null}

          <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">Cruise Day Planner</div>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Cruise Ship</label>
                <select
                  value={shipInput}
                  onChange={(e) => setShipInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select your ship...</option>
                  {SHIP_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-56">
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Sail Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (shipInput && dateInput) {
                    setCruise(shipInput, dateInput);
                    setFitScheduleOnly(true);
                  }
                }}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
              >
                Find My Best Fits
              </button>
              <button
                type="button"
                onClick={() => {
                  setShipInput("");
                  setDateInput("");
                  setFitScheduleOnly(false);
                  clearCruise();
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Clear Plan
              </button>
            </div>

            {profileComplete ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Trip Snapshot</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{shipInput}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{effectiveDate}</span>
                    {itineraryPort ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Port {itineraryPort}
                      </span>
                    ) : null}
                    {itineraryHint?.window ? (
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                        Window {itineraryHint.window}
                      </span>
                    ) : null}
                  </div>
                  <label className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={fitScheduleOnly}
                      onChange={(e) => setFitScheduleOnly(e.target.checked)}
                    />
                    Show only tours that fit this ship date
                  </label>
                  {fitScheduleOnly && profileComplete ? (
                    <div className="mt-2 text-xs text-slate-600">
                      {fitLoading ? "Checking live schedule fit..." : `Checked ${fitChecked} tours for this date`}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Saved Itinerary</div>
                  {plannedForDate.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {plannedForDate.slice(0, 4).map((it) => (
                        <li key={it.id} className="text-sm text-slate-800">
                          <span className="font-bold">{timeLabel(it.startAt) || "Time TBD"}</span> {it.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-slate-600">No tours saved for this date yet. Add options you like to build your day plan.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Add your ship and sail date to see tours that fit your cruise schedule and save your plan for next time.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 border-b-2 border-slate-100 pb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setManualCat(cat)}
                className={`rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  activeCat === cat
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {fitScheduleOnly && profileComplete && fitLoading ? (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            Checking which tours fit your cruise day...
          </div>
        ) : null}

        {fitScheduleOnly && profileComplete && !fitLoading && filtered.length < 1 ? (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <div className="text-base font-black">No tour matches found for this ship/date</div>
            <p className="mt-1 text-sm">
              Try another date, turn off fit filtering, or browse all tours first.
            </p>
            <button
              type="button"
              onClick={() => setFitScheduleOnly(false)}
              className="mt-3 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-700"
            >
              Browse All Tours
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <Link key={`${tour.company}:${tour.pk}`} href={`/tours/${tour.company}/${tour.pk}`} className="group flex flex-col">
              <div className="mb-6 aspect-[4/3] overflow-hidden rounded-3xl border-2 border-transparent bg-slate-100 transition-all group-hover:border-blue-500">
                <img
                  src={tour.image || "/hero/hero5678.jpg"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={tour.title}
                />
              </div>
              <div className="flex-grow">
                <div className="mb-4 flex items-start justify-between">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                    {tour.category || "Adventures"}
                  </span>
                  <div className="text-2xl font-black text-slate-900">{tour.fromPrice || "Check Price"}</div>
                </div>
                {(fitScheduleOnly && profileComplete) ? (
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-wide">
                    {matchMap[dateKeyFor(tour)]?.status === "match" ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                        Fits {effectiveDate}{matchMap[dateKeyFor(tour)]?.firstStartAt ? ` • ${timeLabel(matchMap[dateKeyFor(tour)]?.firstStartAt)}` : ""}
                      </span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "checking" ? (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">Checking schedule...</span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "no_match" ? (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-500">No slots on {effectiveDate}</span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "error" ? (
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">Schedule check failed</span>
                    ) : null}
                  </div>
                ) : null}
                <h3 className="mb-3 text-2xl font-black uppercase tracking-tighter leading-none text-slate-900 group-hover:text-blue-600">
                  {tour.title}
                </h3>
                <p className="line-clamp-2 text-sm italic leading-relaxed text-slate-500">{tour.description || ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
