"use client";

import Header from "@/components/Header";
import LandingToBioTrack from "@/components/LandingToBioTrack";
import Collabs from "@/components/Collabs";
import Club from "@/components/Club";
import Clients from "@/components/Clients";
import Commune from "@/components/Commune";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      
      {/* 1. Combined Scoped Animation Track (Landing Background Video -> Concrete Bio Section Layout) */}
      <LandingToBioTrack />

      {/* 2. Standard Document Content Flow (Scrolls upward normally past the Bio block tracking coordinates) */}
      <main className="bg-black relative z-20">
        <Collabs />
        <Club />
        <Clients />
        <Commune />
        <Footer />
      </main>
    </>
  );
}