"use client";

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
import { ReservationProvider } from "@/context/ReservationContext";

export default function Home() {
  return (
    <ReservationProvider>
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
