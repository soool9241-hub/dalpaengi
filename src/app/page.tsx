"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Recommend from "@/components/Recommend";
import Programs from "@/components/Programs";
import Spaces from "@/components/Spaces";
import Gallery from "@/components/Gallery";
import Reviews from "@/components/Reviews";
import Reservation from "@/components/Reservation";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import EventPopup from "@/components/EventPopup";
import { ReservationProvider, useReservation } from "@/context/ReservationContext";

function QueryParamHandler() {
  const params = useSearchParams();
  const { setSelectedProgramId, setSelectedCheckInDate } = useReservation();

  useEffect(() => {
    const program = params.get("program");
    const date = params.get("date");

    if (program) {
      setSelectedProgramId(program as "stay" | "half" | "daynight" | "jolib" | "healing");
    }
    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      if (y && m && d) {
        setSelectedCheckInDate({ year: y, month: m - 1, day: d });
      }
    }
    if (program || date) {
      setTimeout(() => {
        document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [params, setSelectedProgramId, setSelectedCheckInDate]);

  return null;
}

export default function Home() {
  return (
    <ReservationProvider>
      <Suspense fallback={null}>
        <QueryParamHandler />
      </Suspense>
      <EventPopup />
      <main className="min-h-screen">
        <Header />
        <Hero />
        <Recommend />
        <Programs />
        <Spaces />
        <Gallery />
        <Reviews />
        <Reservation />
        <FAQ />
        <Contact />
        <Footer />
      </main>
    </ReservationProvider>
  );
}
