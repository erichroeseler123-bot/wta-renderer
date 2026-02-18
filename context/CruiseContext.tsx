"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

type CruiseIdentity = {
  ship: string | null;
  date: string | null;
  setCruise: (ship: string, date: string) => void;
};

const CruiseContext = createContext<CruiseIdentity | undefined>(undefined);

export function CruiseProvider({ children }: { children: ReactNode }) {
  const [cruise, setCruiseState] = useState<{ship: string, date: string} | null>(null);
  const setCruise = (ship: string, date: string) => setCruiseState({ ship, date });

  return (
    <CruiseContext.Provider value={{ ship: cruise?.ship || null, date: cruise?.date || null, setCruise }}>
      {children}
    </CruiseContext.Provider>
  );
}

export const useCruise = () => {
  const context = useContext(CruiseContext);
  if (!context) throw new Error("useCruise must be used within CruiseProvider");
  return context;
};
