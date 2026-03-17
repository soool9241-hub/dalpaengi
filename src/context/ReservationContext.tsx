"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ProgramId = "stay" | "half" | "daynight" | "jolib" | "healing" | null;

interface SelectedDateInfo {
  year: number;
  month: number;
  day: number;
}

interface ReservationContextType {
  selectedProgramId: ProgramId;
  setSelectedProgramId: (id: ProgramId) => void;
  selectedCheckInDate: SelectedDateInfo | null;
  setSelectedCheckInDate: (date: SelectedDateInfo | null) => void;
  isMTPackage: boolean;
  setIsMTPackage: (v: boolean) => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [selectedProgramId, setSelectedProgramId] = useState<ProgramId>(null);
  const [selectedCheckInDate, setSelectedCheckInDate] = useState<SelectedDateInfo | null>(null);
  const [isMTPackage, setIsMTPackage] = useState(false);

  return (
    <ReservationContext.Provider value={{ selectedProgramId, setSelectedProgramId, selectedCheckInDate, setSelectedCheckInDate, isMTPackage, setIsMTPackage }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservation must be used within ReservationProvider");
  return ctx;
}
