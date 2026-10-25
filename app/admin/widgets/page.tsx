"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HelicopterTour } from "@/lib/helicopterTours";
import {
  buildWidgetBookingUrl,
  buildWidgetEmbedUrl,
  buildWidgetFallbackCardSnippet,
  buildWidgetIframeOnlySnippet,
  buildWidgetIframeSnippet,
  buildWidgetResizeScript,
  DEFAULT_WIDGET_ACCENT,
  sanitizeAccentColor,
  sanitizePlacementLabel,
  type WidgetLayoutMode,
  type WidgetPriceDisplay,
} from "@/lib/tourWidget";
import { WidgetProduct } from "@/components/widget/WidgetProduct";

type CatalogTourRow = HelicopterTour & {
  operatorName: string;
  portName: string;
  hasImage: boolean;
  durationLabel: string | null;
  descriptionLabel: string;
  priceDisplay: WidgetPriceDisplay;
};

const ACCENT_PRESETS = [
  { label: "Alaska Slate (Default)", hex: "#0f172a" },
  { label: "Glacier Blue", hex: "#0369a1" },
  { label: "Spruce Pine", hex: "#14532d" },
  { label: "Warm Ember", hex: "#c2410c" },
  { label: "Deep Fjord", hex: "#1e3a8a" },
] as const;

export default function AdminWidgetBuilderPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tours, setTours] = useState<CatalogTourRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPort, setSelectedPort] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedKey, setSelectedKey] = useState<string>("");

  const [layout, setLayout] = useState<WidgetLayoutMode>("card");
  const [accentInput, setAccentInput] = useState<string>(DEFAULT_WIDGET_ACCENT);
  const [placementInput, setPlacementInput] = useState<string>("");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [useProductionOrigin, setUseProductionOrigin] = useState<boolean>(true);
  const [activeSnippetTab, setActiveSnippetTab] = useState<
    "iframe" | "iframe_noscript" | "fallback" | "urls"
  >("iframe");
  const [copiedLabel, setCopiedLabel] = useState<string>("");

  const loadCatalog = useCallback(async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch("/api/admin/widget-catalog", { cache: "no-store" });
      if (!res.ok) {
        setAuthed(false);
        setTours([]);
        return;
      }
      const data = await res.json();
      if (data?.success && Array.isArray(data.tours)) {
        setAuthed(true);
        setTours(data.tours);
        if (data.tours.length > 0) {
          setSelectedKey((prev) => prev || `${data.tours[0].company}:${data.tours[0].pk}`);
        }
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setAuthError(data?.error || "Login failed. Check your admin password.");
        return;
      }
      setPassword("");
      await loadCatalog();
    } catch {
      setAuthError("Unable to reach login endpoint.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthed(false);
    setTours([]);
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of tours) {
      if (t.category) set.add(t.category);
    }
    return Array.from(set).sort();
  }, [tours]);

  const filteredTours = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tours.filter((tour) => {
      if (selectedPort !== "all" && tour.port !== selectedPort) return false;
      if (selectedCategory !== "all" && tour.category !== selectedCategory) return false;
      if (!q) return true;
      const haystack = `${tour.title} ${tour.operatorName} ${tour.company} ${tour.port} ${tour.pk} ${tour.category || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [tours, searchQuery, selectedPort, selectedCategory]);

  const selectedTour = useMemo(() => {
    const exact = tours.find((t) => `${t.company}:${t.pk}` === selectedKey);
    if (exact) return exact;
    return filteredTours[0] || tours[0] || null;
  }, [tours, filteredTours, selectedKey]);

  const sanitizedPlacement = useMemo(
    () => sanitizePlacementLabel(placementInput),
    [placementInput],
  );

  const accentTheme = useMemo(
    () => sanitizeAccentColor(accentInput),
    [accentInput],
  );

  const baseUrl = useMemo(() => {
    if (useProductionOrigin) return "https://www.welcometoalaskatours.com";
    if (typeof window !== "undefined") return window.location.origin;
    return "https://www.welcometoalaskatours.com";
  }, [useProductionOrigin]);

  const iframeSnippet = useMemo(() => {
    if (!selectedTour) return "";
    return buildWidgetIframeSnippet({
      baseUrl,
      tour: selectedTour,
      layout,
      accent: accentTheme.hex,
      placement: sanitizedPlacement,
    });
  }, [baseUrl, selectedTour, layout, accentTheme.hex, sanitizedPlacement]);

  const iframeOnlySnippet = useMemo(() => {
    if (!selectedTour) return "";
    return buildWidgetIframeOnlySnippet({
      baseUrl,
      tour: selectedTour,
      layout,
      accent: accentTheme.hex,
      placement: sanitizedPlacement,
    });
  }, [baseUrl, selectedTour, layout, accentTheme.hex, sanitizedPlacement]);

  const resizeScriptSnippet = useMemo(() => buildWidgetResizeScript(), []);

  const fallbackSnippet = useMemo(() => {
    if (!selectedTour) return "";
    return buildWidgetFallbackCardSnippet({
      baseUrl,
      tour: selectedTour,
      layout,
      accent: accentTheme.hex,
      placement: sanitizedPlacement,
    });
  }, [baseUrl, selectedTour, layout, accentTheme.hex, sanitizedPlacement]);

  const embedUrl = useMemo(() => {
    if (!selectedTour) return "";
    return buildWidgetEmbedUrl({
      baseUrl,
      company: selectedTour.company,
      pk: selectedTour.pk,
      layout,
      accent: accentTheme.hex,
      placement: sanitizedPlacement,
    });
  }, [baseUrl, selectedTour, layout, accentTheme.hex, sanitizedPlacement]);

  const bookingHandoffUrl = useMemo(() => {
    if (!selectedTour) return "";
    return buildWidgetBookingUrl({
      baseUrl,
      company: selectedTour.company,
      pk: selectedTour.pk,
      slug: selectedTour.slug,
      port: selectedTour.port,
      placement: sanitizedPlacement,
    });
  }, [baseUrl, selectedTour, sanitizedPlacement]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(label);
      window.setTimeout(() => {
        setCopiedLabel((current) => (current === label ? "" : current));
      }, 2400);
    } catch {
      setCopiedLabel("Copy failed");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Admin Top Header */}
      <header className="border-b border-white/10 bg-zinc-900/80 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white">
              WTA Owner Widget Builder
            </h1>
            <nav aria-label="Owner tools navigation" className="flex items-center gap-2 text-xs">
              <Link
                href="/admin"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                &larr; Admin Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
              >
                Orders &amp; Attribution
              </Link>
            </nav>
          </div>

          {authed ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400">
                ● {tours.length} Active Catalog Tours Loaded
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {checkingAuth ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
            Checking owner session…
          </div>
        ) : !authed ? (
          <form
            onSubmit={handleLogin}
            data-testid="admin-widget-login-form"
            className="mx-auto max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-white">Owner Authentication Required</h2>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Sign in with your Welcome to Alaska Tours owner password to browse the catalog and generate embeddable tour widgets.
            </p>
            <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Admin Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                data-testid="admin-password-input"
                className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-sky-400 focus:outline-none"
              />
            </label>
            {authError ? (
              <div role="alert" className="mt-3 text-xs font-semibold text-rose-400">
                {authError}
              </div>
            ) : null}
            <button
              type="submit"
              data-testid="admin-login-submit"
              className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400"
            >
              Sign In to Widget Builder
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Step 1 & 2: Search & Select Tour from Catalog */}
            <section
              aria-label="Step 1: Search and select a tour"
              className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/90 p-5 lg:col-span-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                    Step 1 &amp; 2
                  </span>
                  <h2 className="text-base font-bold text-white">
                    Search &amp; Select a Catalog Tour
                  </h2>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {filteredTours.length} of {tours.length}
                </span>
              </div>

              {/* Search & Filter Controls */}
              <div className="mt-4 space-y-3">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by tour title, operator, port, or item ID…"
                  aria-label="Search tour catalog"
                  data-testid="widget-catalog-search"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-sky-400 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="block text-[11px] font-semibold text-zinc-400">
                    Port
                    <select
                      value={selectedPort}
                      onChange={(e) => setSelectedPort(e.target.value)}
                      data-testid="widget-port-filter"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="all">All Ports ({tours.length})</option>
                      <option value="juneau">Juneau</option>
                      <option value="skagway">Skagway</option>
                      <option value="ketchikan">Ketchikan</option>
                    </select>
                  </label>

                  <label className="block text-[11px] font-semibold text-zinc-400">
                    Category
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      data-testid="widget-category-filter"
                      className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {/* Catalog List */}
              <div
                data-testid="widget-catalog-list"
                className="mt-4 max-h-[540px] space-y-2 overflow-y-auto pr-1"
              >
                {filteredTours.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center text-xs text-zinc-400">
                    No tours match your current filters.
                  </div>
                ) : (
                  filteredTours.map((tour) => {
                    const key = `${tour.company}:${tour.pk}`;
                    const isSelected =
                      selectedTour &&
                      selectedTour.company === tour.company &&
                      selectedTour.pk === tour.pk;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedKey(key)}
                        data-testid={`catalog-tour-${tour.company}-${tour.pk}`}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-sky-400 bg-sky-500/15 text-white shadow-sm"
                            : "border-white/10 bg-black/30 text-zinc-200 hover:border-white/25 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                            {tour.portName} · {tour.operatorName}
                          </span>
                          <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                            #{tour.pk}
                          </span>
                        </div>
                        <div className="mt-1 text-sm font-bold leading-snug text-white">
                          {tour.title}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                          <span>
                            {tour.priceDisplay.supported
                              ? `${tour.priceDisplay.amountLabel} ${tour.priceDisplay.currency}`
                              : "Check current price"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {tour.durationLabel ? (
                              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-300">
                                {tour.durationLabel}
                              </span>
                            ) : null}
                            {!tour.hasImage ? (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                                No image
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            {/* Step 3, 4, 5: Customize, Preview, and Copy Embed Code */}
            <section
              aria-label="Configure, preview, and copy widget embed code"
              className="space-y-6 lg:col-span-7"
            >
              {/* Step 4: Layout, Accent Color & Placement Label */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                  Step 3 &amp; 4
                </span>
                <h2 className="text-base font-bold text-white">
                  Customize Layout, Accent Color &amp; Placement Attribution
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Layout Selector */}
                  <div>
                    <span className="block text-xs font-semibold text-zinc-300">
                      Widget Layout
                    </span>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLayout("card")}
                        data-testid="layout-option-card"
                        className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          layout === "card"
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-black/30 text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="font-bold">Standard Card</div>
                        <div className="mt-0.5 text-[11px] text-zinc-400">
                          Vertical photo card (up to 420px)
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLayout("compact")}
                        data-testid="layout-option-compact"
                        className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                          layout === "compact"
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-black/30 text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        <div className="font-bold">Compact Horizontal</div>
                        <div className="mt-0.5 text-[11px] text-zinc-400">
                          Wide banner row (stacks on mobile)
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300">
                      Optional Button Accent Color
                    </label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="color"
                        value={accentTheme.hex}
                        onChange={(e) => setAccentInput(e.target.value)}
                        aria-label="Choose accent color"
                        className="h-10 w-12 cursor-pointer rounded-lg border border-white/15 bg-black p-1"
                      />
                      <input
                        type="text"
                        value={accentInput}
                        onChange={(e) => setAccentInput(e.target.value)}
                        placeholder="#0f172a"
                        data-testid="widget-accent-input"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 font-mono text-xs text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ACCENT_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setAccentInput(preset.hex)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-white/30 hover:text-white"
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Placement Label + Origin Selector */}
                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300">
                      Optional Placement Label
                      <input
                        type="text"
                        value={placementInput}
                        onChange={(e) => setPlacementInput(e.target.value)}
                        placeholder="e.g. hotel-homepage or partner-blog"
                        data-testid="widget-placement-input"
                        className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-sky-400 focus:outline-none"
                      />
                    </label>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
                      Tags widget clicks &amp; checkout orders ({sanitizedPlacement ? <code className="text-sky-300">{sanitizedPlacement}</code> : "none"}). Cannot alter Stripe or FareHarbor reseller credentials.
                    </p>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-zinc-300">
                      Snippet Target Host
                    </span>
                    <div className="mt-1.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUseProductionOrigin(true)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                          useProductionOrigin
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-black/30 text-zinc-400"
                        }`}
                      >
                        welcometoalaskatours.com
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseProductionOrigin(false)}
                        className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold ${
                          !useProductionOrigin
                            ? "border-sky-400 bg-sky-500/20 text-white"
                            : "border-white/10 bg-black/30 text-zinc-400"
                        }`}
                      >
                        Current Host
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Widget Preview */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                      Live Widget Preview
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {selectedTour ? `${selectedTour.title} (${selectedTour.portName})` : "Select a tour"}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewViewport("desktop")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        previewViewport === "desktop"
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      Desktop Width
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewViewport("mobile")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        previewViewport === "mobile"
                          ? "bg-white text-slate-900"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      Mobile (340px)
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex justify-center rounded-2xl border border-dashed border-white/15 bg-stone-100 p-4 sm:p-6">
                  <div
                    data-testid="widget-builder-preview-container"
                    className="w-full transition-all"
                    style={{
                      maxWidth:
                        previewViewport === "mobile"
                          ? "340px"
                          : layout === "compact"
                            ? "720px"
                            : "410px",
                    }}
                  >
                    {selectedTour ? (
                      <Suspense fallback={<div className="p-4 text-xs text-slate-600">Loading preview…</div>}>
                        <WidgetProduct
                          tour={selectedTour}
                          status="active"
                          initialLayout={layout}
                          initialAccent={accentTheme.hex}
                          initialPlacement={sanitizedPlacement}
                        />
                      </Suspense>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Step 5: Copy Embed Code */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/90 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-sky-400">
                      Step 5
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Copy &amp; Paste Embed Code
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveSnippetTab("iframe")}
                      data-testid="snippet-tab-iframe"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        activeSnippetTab === "iframe"
                          ? "bg-sky-500 text-slate-950"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      1. Iframe + Auto-Resize
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSnippetTab("iframe_noscript")}
                      data-testid="snippet-tab-iframe-noscript"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        activeSnippetTab === "iframe_noscript"
                          ? "bg-sky-500 text-slate-950"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      2. Iframe Only (No Script)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSnippetTab("fallback")}
                      data-testid="snippet-tab-fallback"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        activeSnippetTab === "fallback"
                          ? "bg-sky-500 text-slate-950"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      3. Static Link Fallback
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSnippetTab("urls")}
                      data-testid="snippet-tab-urls"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        activeSnippetTab === "urls"
                          ? "bg-sky-500 text-slate-950"
                          : "bg-white/10 text-zinc-300 hover:bg-white/15"
                      }`}
                    >
                      Direct URLs
                    </button>
                  </div>
                </div>

                {activeSnippetTab === "iframe" ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-zinc-400">
                        Recommended for websites that allow HTML and scripts. Includes the live <code>&lt;iframe&gt;</code> widget plus an optional resize script that verifies the widget origin and resizes only its own frame.
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(iframeSnippet, "Iframe snippet copied!")}
                        data-testid="copy-iframe-snippet-btn"
                        className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400"
                      >
                        {copiedLabel === "Iframe snippet copied!" ? "✓ Copied!" : "Copy Iframe + Script"}
                      </button>
                    </div>
                    <pre
                      data-testid="iframe-snippet-code"
                      className="mt-3 max-h-64 overflow-x-auto rounded-xl border border-white/10 bg-black/70 p-4 font-mono text-xs leading-relaxed text-sky-200"
                    >
                      {iframeSnippet}
                    </pre>
                  </div>
                ) : activeSnippetTab === "iframe_noscript" ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-zinc-400">
                          Use this pure <code>&lt;iframe&gt;</code> snippet when a website editor allows iframes but strips <code>&lt;script&gt;</code> tags. Scrolling is never locked, so the booking button remains accessible on narrow phones and large text sizes.
                        </p>
                        <button
                          type="button"
                          onClick={() => copyText(iframeOnlySnippet, "Iframe-only snippet copied!")}
                          data-testid="copy-iframe-only-snippet-btn"
                          className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400"
                        >
                          {copiedLabel === "Iframe-only snippet copied!" ? "✓ Copied!" : "Copy Iframe Only"}
                        </button>
                      </div>
                      <pre
                        data-testid="iframe-only-snippet-code"
                        className="mt-3 max-h-48 overflow-x-auto rounded-xl border border-white/10 bg-black/70 p-4 font-mono text-xs leading-relaxed text-sky-200"
                      >
                        {iframeOnlySnippet}
                      </pre>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-300">
                          Optional Auto-Resize Script (only needed once per page if scripts are allowed)
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(resizeScriptSnippet, "Resize script copied!")}
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                        >
                          {copiedLabel === "Resize script copied!" ? "✓ Copied!" : "Copy Resize Script"}
                        </button>
                      </div>
                      <pre className="mt-2 max-h-36 overflow-x-auto rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
                        {resizeScriptSnippet}
                      </pre>
                    </div>
                  </div>
                ) : activeSnippetTab === "fallback" ? (
                  <div className="mt-4">
                    <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                      <strong>Static HTML Notice:</strong> Unlike the <code>&lt;iframe&gt;</code> embed, a copied HTML card <strong>cannot receive catalog updates automatically</strong>. To prevent stale pricing or schedule claims on partner sites, its price text defaults to <em>&ldquo;Check current price&rdquo;</em> and volatile details are omitted.
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-zinc-400">
                        Use this ordinary linked HTML card only on platforms or email newsletters that prohibit <code>&lt;iframe&gt;</code> embeds.
                      </p>
                      <button
                        type="button"
                        onClick={() => copyText(fallbackSnippet, "Fallback card copied!")}
                        data-testid="copy-fallback-snippet-btn"
                        className="shrink-0 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-sky-400"
                      >
                        {copiedLabel === "Fallback card copied!" ? "✓ Copied!" : "Copy Static Fallback HTML"}
                      </button>
                    </div>
                    <pre
                      data-testid="fallback-snippet-code"
                      className="mt-3 max-h-64 overflow-x-auto rounded-xl border border-white/10 bg-black/70 p-4 font-mono text-xs leading-relaxed text-emerald-200"
                    >
                      {fallbackSnippet}
                    </pre>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">
                          Stable Widget Embed URL
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(embedUrl, "Embed URL copied!")}
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                        >
                          {copiedLabel === "Embed URL copied!" ? "✓ Copied!" : "Copy Embed URL"}
                        </button>
                      </div>
                      <code className="mt-1.5 block break-all rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-sky-300">
                        {embedUrl}
                      </code>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300">
                          Direct Booking Calendar Handoff URL
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(bookingHandoffUrl, "Booking URL copied!")}
                          className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
                        >
                          {copiedLabel === "Booking URL copied!" ? "✓ Copied!" : "Copy Booking URL"}
                        </button>
                      </div>
                      <code className="mt-1.5 block break-all rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-xs text-emerald-300">
                        {bookingHandoffUrl}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
