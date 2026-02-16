"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  availabilityPk?: number;
  startAt?: string;
  price?: number;
  id: string; // `${company}:${itemPk}`
  company: string;
  itemPk: number;
  title: string;
  headline?: string;
  image?: string;
  supplierLabel?: string;
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
  setSelection: (
    id: string,
    patch: { availabilityPk: number; startAt: string; price?: number },
  ) => void;
  clear: () => void;
};

const CartCtx = createContext<CartAPI | null>(null);

const STORAGE_KEY = "wta_itinerary_cart_v2";

function clampQty(n: number) {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.floor(n)));
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CartState>({ items: [], isOpen: false });

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: CartItem[] } | null;
      if (!parsed?.items || !Array.isArray(parsed.items)) return;

      // minimal validation
      const items = parsed.items
        .map((it) => ({
          ...it,
          qty: clampQty((it as any).qty),
          id: typeof it.id === "string" ? it.id : `${it.company}:${it.itemPk}`,
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
        const id = `${item.company}:${item.itemPk}`;
        const addQty = clampQty(qty);

        setState((s) => {
          const idx = s.items.findIndex((x) => x.id === id);
          if (idx >= 0) {
            const copy = [...s.items];
            copy[idx] = { ...copy[idx], qty: clampQty(copy[idx].qty + addQty) };
            return { ...s, items: copy };
          }
          return {
            ...s,
            items: [...s.items, { ...item, id, qty: addQty }],
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
          items: s.items.map((x) => (x.id === id ? { ...x, qty: q } : x)),
        }));
      },

      setSelection: (id, patch) => {
        setState((s) => ({
          ...s,
          items: s.items.map((x) =>
            x.id === id
              ? {
                  ...x,
                  availabilityPk: patch.availabilityPk,
                  startAt: patch.startAt,
                  price: patch.price,
                }
              : x,
          ),
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
  return Array.from(m.entries()).map(([supplier, items]) => ({
    supplier,
    items,
  }));
}

export function fareharborItemCheckoutUrl(
  company: string,
  itemPk: number,
  backUrl: string,
) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const back = encodeURIComponent(backUrl);

  // FareHarbor embed booking URL pattern
  return `https://fareharbor.com/embeds/book/${company}/items/${itemPk}/calendar/${yyyy}/${mm}/?full-items=yes&back=${back}&g4=yes`;
}
