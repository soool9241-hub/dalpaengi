"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface PricingData {
  stay: number;
  half: number;
  halfExtra: number;
  daynight: number;
  extraGuest: number;
  bbqGrill: number;
  gasRange: number;
  dinner: number;
  woodcraft: number;
  potBbq: number;
  miniPool: number;
}

export interface BusRoutes {
  [key: string]: number;
}

interface SettingsContextType {
  pricing: PricingData;
  busRoutes: BusRoutes;
  loaded: boolean;
}

const DEFAULT_PRICING: PricingData = {
  stay: 700000,
  half: 400000,
  halfExtra: 200000,
  daynight: 400000,
  extraGuest: 10000,
  bbqGrill: 30000,
  gasRange: 15000,
  dinner: 10000,
  woodcraft: 20000,
  potBbq: 30000,
  miniPool: 50000,
};

const DEFAULT_BUS_ROUTES: BusRoutes = {
  "전북대": 600000,
  "전주대": 650000,
  "원광대": 700000,
  "우석대": 650000,
};

const SettingsContext = createContext<SettingsContextType>({
  pricing: DEFAULT_PRICING,
  busRoutes: DEFAULT_BUS_ROUTES,
  loaded: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [pricing, setPricing] = useState<PricingData>(DEFAULT_PRICING);
  const [busRoutes, setBusRoutes] = useState<BusRoutes>(DEFAULT_BUS_ROUTES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.pricing) setPricing(data.pricing);
        if (data.bus_routes) setBusRoutes(data.bus_routes);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  return (
    <SettingsContext.Provider value={{ pricing, busRoutes, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function usePricing() {
  const { pricing, busRoutes, loaded } = useContext(SettingsContext);
  return { pricing, busRoutes, loaded };
}
