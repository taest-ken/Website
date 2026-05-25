"use client";
import Header from "@/components/Header";
import BioSection from "@/components/BioSection";
import Collabs from "@/components/Collabs";
import Club from "@/components/Club";
import Clients from "@/components/Clients";
import Commune from "@/components/Commune";
import Footer from "@/components/Footer";
import ScrollRigClient from '@/components/ScrollRigClient';

export default function Home() {
  return (
    <>
      <Header />
      <ScrollRigClient>
        {/* Navigation Order: Bio -> Collabs -> Club -> Clients -> Commune -> Contact */}
        <section className="pt-20">
          <BioSection />
        </section>

        <Collabs />
        <Club />
        <Clients />
        <Commune />
        
        {/* Footer acts as the general Contact section */}
        <Footer />
      </ScrollRigClient>
    </>
  );
}