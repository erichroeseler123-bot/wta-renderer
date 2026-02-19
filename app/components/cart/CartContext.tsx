"use client";

"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  // identity + display
  id: string; // unique per selected departure+rate
  title: string;
  headline?: string;
  image?: string;
  supplierLabel?: string;

  // fareharbor core
  kind?: "fareharbor";
  company: string;
  itemPk: number;

  // selection (what makes it bookable)
  day?: string; // YYYY-MM-DD
  availabilityPk?: number;
  startAt?: string;
  price?: number; // cents

  // rate / pricing
  ratePk?: number;
  rateLabel?: string;
  unitCents?: number; // cents
  unitCentsWithTax?: number | null; // cents
  lineCents?: number; // cents = unitCents * qty

  qty: number;
  };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
};

type CartAPI = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;

  addItem: (item: Omit<CartItem, "id" | "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;

  // keep this for places already calling it
  setSelection: (
    id: string,
    patch: {
      day?: string;
      availabilityPk: number;
      startAt: string;
      price?: number; // cents
      ratePk?: number;
      rateLabel?: string;
      unitCents?: number;
      unitCentsWithTax?: number | null;
    },
  ) => void;

  clear: () => void;
};

const CartCtx = createContext<CartAPI | null>(null);
const STORAGE_KEY = "wta_itinerary_cart_v3";

function clampQty(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.floor(n)));
}

function makeId(item: Omit<CartItem, "id">) {
  // If we have a real selection, make it unique per departure+rate
  if (item.availabilityPk && item.startAt) {
    const r = item.ratePk ? String(item.ratePk) : "0";
    return `${item.company}:${item.itemPk}:${item.availabilityPk}:${r}`;
  }
  // fallback (legacy)
  return `${item.company}:${item.itemPk}`;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [], isOpen: false });

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: CartItem[] } | null;
      if (!parsed?.items || !Array.isArray(parsed.items)) return;

      const items = parsed.items
        .map((it) => ({
          ...it,
          qty: clampQty((it as any).qty),
          id:
            typeof it.id === "string" && it.id
              ? it.id
              : makeId({ ...(it as any), qty: clampQty((it as any).qty) }),
        }))
        .filter((it) => it.company && Number.isFinite(it.itemPk) && it.title);

      setState((s) => ({ ...s, items }));
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
    } catch {
      // ignore
    }
  }, [state.items]);

  const api: CartAPI = useMemo(() => {
    const count = state.items.reduce((sum, it) => sum + (it.qty || 0), 0);

    return {
      items: state.items,
      count,
      isOpen: state.isOpen,
      open: () => setState((s) => ({ ...s, isOpen: true })),
      close: () => setState((s) => ({ ...s, isOpen: false })),

      addItem: (item, qty = 1) => {
        const addQty = clampQty(qty);
        const id = makeId({ ...(item as any), qty: addQty });

        setState((s) => {
          const idx = s.items.findIndex((x) => x.id === id);
          if (idx >= 0) {
            const copy = [...s.items];
            const nextQty = clampQty(copy[idx].qty + addQty);

            const unit = copy[idx].unitCents ?? copy[idx].price ?? 0;
            copy[idx] = {
              ...copy[idx],
              qty: nextQty,
              lineCents: unit ? unit * nextQty : copy[idx].lineCents,
            };
            return { ...s, items: copy };
          }

          const unit = (item as any).unitCents ?? (item as any).price ?? 0;
          return {
            ...s,
            items: [
              ...s.items,
              {
                ...(item as any),
                id,
                qty: addQty,
                kind: (item as any).kind ?? "fareharbor",
                unitCents: (item as any).unitCents ?? ((item as any).price ?? undefined),
                lineCents: unit ? unit * addQty : (item as any).lineCents,
              },
            ],
          };
        });
      },

      removeItem: (id) => {
        setState((s) => ({ ...s, items: s.items.filter((x) => x.id !== id) }));
      },

      setQty: (id, qty) => {
        const q = clampQty(qty);
        setState((s) => ({
          ...s,
          items: s.items.map((x) => {
            if (x.id !== id) return x;
            const unit = x.unitCents ?? x.price ?? 0;
            return {
              ...x,
              qty: q,
              lineCents: unit ? unit * q : x.lineCents,
            };
          }),
        }));
      },

      setSelection: (id, patch) => {
        setState((s) => ({
          ...s,
          items: s.items.map((x) => {
            if (x.id !== id) return x;

            const unit = patch.unitCents ?? x.unitCents ?? x.price ?? 0;
            const next: CartItem = {
              ...x,
              day: patch.day ?? x.day,
              availabilityPk: patch.availabilityPk,
              startAt: patch.startAt,
              ratePk: patch.ratePk ?? x.ratePk,
              rateLabel: patch.rateLabel ?? x.rateLabel,
              unitCents: patch.unitCents ?? x.unitCents,
              unitCentsWithTax:
                typeof patch.unitCentsWithTax === "number" || patch.unitCentsWithTax === null
                  ? patch.unitCentsWithTax
                  : x.unitCentsWithTax,
              lineCents: unit ? unit * (x.qty || 1) : x.lineCents,
            };

            // If it becomes a "real selection", its id should be selection-unique.
            const nextId = makeId(next);
            return { ...next, id: nextId };
          }),
        }));
      },

      clear: () => setState((s) => ({ ...s, items: [] })),
    };
  }, [state.items, state.isOpen]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function groupBySupplier(items: CartItem[]) {
  const m = new Map<string, CartItem[]>();
  for (const it of items) {
    const key = it.supplierLabel || it.company || "Unknown supplier";
    const arr = m.get(key) || [];
    arr.push(it);
    m.set(key, arr);
  }
  return Array.from(m.entries()).map(([supplier, items]) => ({ supplier, items }));
}

export function fareharborItemCheckoutUrl(company: string, itemPk: number, backUrl: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const back = encodeURIComponent(backUrl);
  return `https://fareharbor.com/embeds/book/${company}/items/${itemPk}/calendar/${yyyy}/${mm}/?full-items=yes&back=${back}&g4=yes`;
}

// tiny helper for UI
export function formatCents(c?: number | null) {
  if (!Number.isFinite(c as any)) return "";
  return `$${((c as number) / 100).toFixed(2)}`;
}
