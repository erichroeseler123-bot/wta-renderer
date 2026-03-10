"use client";

import { useState } from "react";

type NewsletterSignupProps = {
  source: string;
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
};

export default function NewsletterSignup({
  source,
  title = "Get Alaska Cruise & Tour Updates",
  description = "Tour news, wildlife and environmental updates, cruise tips, and fun Alaska facts. Unsubscribe anytime.",
  compact = false,
  className = "",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setStatus("idle");
    setMessage("");
    setLoading(true);
    try {
      const r = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) {
        throw new Error(j?.error || "Subscribe failed");
      }
      setStatus("success");
      setMessage("You’re subscribed. Watch your inbox for Alaska updates.");
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscribe failed";
      setStatus("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`.trim()}>
      <h3 className="text-lg font-black tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <form
        onSubmit={onSubmit}
        className={`mt-4 grid gap-2 ${compact ? "sm:grid-cols-[1fr_auto]" : "sm:grid-cols-[1fr_auto]"}`}
      >
        <label className="sr-only" htmlFor={`newsletter-${source}`}>
          Email
        </label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Subscribing..." : "Subscribe Free"}
        </button>
      </form>

      <p className="mt-2 text-xs text-slate-500">
        We respect your inbox. Easy unsubscribe in every email.
      </p>
      {status === "success" ? (
        <p className="mt-2 text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {status === "error" ? (
        <p className="mt-2 text-sm font-semibold text-rose-700">{message}</p>
      ) : null}
    </section>
  );
}
