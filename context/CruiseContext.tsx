"use client";
import { createContext, useContext, useState, ReactNode, useSyncExternalStore } from "react";

type CruiseIdentity = {
  ship: string | null;
  date: string | null;
  loaded: boolean;
  setCruise: (ship: string, date: string) => void;
  clearCruise: () => void;
};

const CruiseContext = createContext<CruiseIdentity | undefined>(undefined);
const STORAGE_KEY = "wta_cruise_profile_v1";

export function CruiseProvider({ children }: { children: ReactNode }) {
  const loaded = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const [cruise, setCruiseState] = useState<{ ship: string; date: string } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as { ship?: string; date?: string } | null;
      if (!parsed?.ship || !parsed?.date) return null;
      return { ship: parsed.ship, date: parsed.date };
    } catch {
      return null;
    }
  });

  const setCruise = (ship: string, date: string) => {
    const next = { ship, date };
    setCruiseState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const clearCruise = () => {
    setCruiseState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  };

  return (
    <CruiseContext.Provider
      value={{
        ship: cruise?.ship || null,
        date: cruise?.date || null,
        loaded,
        setCruise,
        clearCruise,
      }}
    >
      {children}
    </CruiseContext.Provider>
  );
}

export const useCruise = () => {
  const context = useContext(CruiseContext);
  if (!context) throw new Error("useCruise must be used within CruiseProvider");
  return context;
};
