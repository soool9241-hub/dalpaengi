"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ProgramId = "stay" | "half" | "daynight" | null;

interface ReservationContextType {
  selectedProgramId: ProgramId;
  setSelectedProgramId: (id: ProgramId) => void;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [selectedProgramId, setSelectedProgramId] = useState<ProgramId>(null);

  return (
    <ReservationContext.Provider value={{ selectedProgramId, setSelectedProgramId }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservation must be used within ReservationProvider");
  return ctx;
}
