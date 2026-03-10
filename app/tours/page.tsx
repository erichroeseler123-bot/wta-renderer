"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { inferPortFromCompany } from "@/lib/handoff/mappings";
import { useCruise } from "@/context/CruiseContext";
import { useCart } from "@/app/components/cart/CartContext";
import {
  CRUISE_LINES,
  CRUISE_ITINERARY_HINTS,
  getCruiseLineForShip,
  getFirstSailingDateForShip,
  getShipsForCruiseLine,
} from "@/lib/cruiseShips";

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

function trustLineForTour(tour: Tour, port: string) {
  if (port) return `Popular with ${port[0].toUpperCase()}${port.slice(1)} cruise guests`;
  return "Curated for cruise day timing and easy shore return";
}

export default function ToursPage() {
  const { ship, date: savedDate, loaded, setCruise, clearCruise } = useCruise();
  const { items } = useCart();

  const [tours, setTours] = useState<Tour[]>([]);
  const [manualCat, setManualCat] = useState<string | null>(null);
  const [loadingTours, setLoadingTours] = useState(true);
  const [fitScheduleOnly, setFitScheduleOnly] = useState(true);
  const [lineInput, setLineInput] = useState("");
  const [shipInput, setShipInput] = useState("");
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
    const nextShip = ship || "";
    const nextLine = nextShip ? getCruiseLineForShip(nextShip) : "";
    setLineInput(nextLine);
    setShipInput(ship || "");
    setFitScheduleOnly(Boolean(ship && getFirstSailingDateForShip(ship)));
    setPlanInitialized(true);
  }, [loaded, planInitialized, ship]);

  useEffect(() => {
    if (!loaded || !ship) return;
    const derivedDate = getFirstSailingDateForShip(ship);
    if (derivedDate && savedDate !== derivedDate) {
      setCruise(ship, derivedDate);
    }
  }, [loaded, ship, savedDate, setCruise]);

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

  const effectiveDate = shipInput ? getFirstSailingDateForShip(shipInput) : "";
  const profileComplete = Boolean(shipInput && effectiveDate);
  const selectedLine = lineInput;
  const shipOptions = useMemo(
    () => (selectedLine ? getShipsForCruiseLine(selectedLine) : []),
    [selectedLine],
  );
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
  const fallbackTours = useMemo(() => filteredByQuery.slice(0, 4), [filteredByQuery]);

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

          <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm">
            <div className="mb-4 text-lg font-black tracking-tight text-slate-900">Cruise Day Planner</div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-slate-600">Cruise line</label>
                <select
                  value={selectedLine}
                  onChange={(e) => {
                    setLineInput(e.target.value);
                    setShipInput("");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                >
                  <option value="">Select your cruise line...</option>
                  {CRUISE_LINES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">Ship</label>
                <select
                  value={shipInput}
                  disabled={!selectedLine}
                  onChange={(e) => setShipInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                >
                  <option value="">{selectedLine ? "Select your ship..." : "Select line first"}</option>
                  {shipOptions.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-600">First sailing date</label>
                <div className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
                  {effectiveDate || "Select a ship to load date"}
                </div>
              </div>
                <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (shipInput && effectiveDate) {
                        setCruise(shipInput, effectiveDate);
                        setFitScheduleOnly(true);
                      }
                    }}
                    disabled={!(shipInput && effectiveDate)}
                    className="min-w-52 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Find My Best Fits
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShipInput("");
                      setLineInput("");
                      setFitScheduleOnly(false);
                      clearCruise();
                    }}
                    className="rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Clear plan
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">Trip Snapshot</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shipInput ? (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Ship: {shipInput}
                    </span>
                  ) : null}
                  {effectiveDate ? (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Date: {effectiveDate}
                    </span>
                  ) : null}
                  {itineraryPort ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Port: {itineraryPort}
                    </span>
                  ) : null}
                  {itineraryHint?.window ? (
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      Window: {itineraryHint.window}
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
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="text-sm font-semibold text-slate-900">Saved Itinerary</div>
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
            </div>

            {!profileComplete ? (
              <p className="mt-3 text-sm text-slate-600">
                Add your cruise line and ship to load your first sailing date and find tours that fit your day.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 border-b-2 border-slate-100 pb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setManualCat(cat)}
                className={`rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  activeCat === cat
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            <div className="text-base font-black">Nothing matched this exact cruise timing yet</div>
            <p className="mt-1 text-sm">
              Browse all excursions for this port, or turn off fit filtering to see more options.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setManualCat("All");
                  setFitScheduleOnly(false);
                }}
                className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-700"
              >
                Browse All Excursions
              </button>
              <button
                type="button"
                onClick={() => setFitScheduleOnly(false)}
                className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-700 hover:bg-amber-100"
              >
                Turn Off Fit Filter
              </button>
            </div>
            {fallbackTours.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {fallbackTours.map((tour) => (
                  <Link
                    key={`fallback:${tour.company}:${tour.pk}`}
                    href={`/tours/${tour.company}/${tour.pk}`}
                    className="rounded-xl border border-amber-200 bg-white p-3 hover:border-amber-300"
                  >
                    <div className="text-xs font-semibold text-amber-700">Recommended next</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{tour.title}</div>
                    <div className="mt-1 text-xs text-slate-600">{tour.fromPrice || "Check price and departures"}</div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <Link
              key={`${tour.company}:${tour.pk}`}
              href={`/tours/${tour.company}/${tour.pk}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={tour.image || "/hero/hero5678.jpg"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={tour.title}
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                    {tour.category || "Adventures"}
                  </span>
                  <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                    Cruise Guest Pick
                  </span>
                </div>
              </div>
              <div className="flex flex-grow flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-black tracking-tight leading-none text-slate-900 group-hover:text-blue-600">
                    {tour.title}
                  </h3>
                  <div className="whitespace-nowrap text-xl font-black text-slate-900">{tour.fromPrice || "Check Price"}</div>
                </div>
                <p className="mb-3 text-sm leading-relaxed text-slate-600">{trustLineForTour(tour, portFilter || itineraryPort)}</p>
                {(fitScheduleOnly && profileComplete) ? (
                  <div className="mb-3 text-xs font-bold tracking-wide">
                    {matchMap[dateKeyFor(tour)]?.status === "match" ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                        Fits your cruise day{matchMap[dateKeyFor(tour)]?.firstStartAt ? ` • ${timeLabel(matchMap[dateKeyFor(tour)]?.firstStartAt)}` : ""}
                      </span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "checking" ? (
                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">Checking schedule...</span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "no_match" ? (
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-500">No slots on {effectiveDate}</span>
                    ) : matchMap[dateKeyFor(tour)]?.status === "error" ? (
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">Schedule check failed</span>
                    ) : null}
                  </div>
                ) : null}
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{tour.description || ""}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors group-hover:bg-blue-600">
                    View Tour
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
