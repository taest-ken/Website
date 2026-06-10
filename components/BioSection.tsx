"use client";

import Image from "next/image";

export default function BioSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-8 py-20 overflow-hidden">
      
      {/* 1. The Textured Background */}
      <Image 
        src="/images/bio-bg.jpg" 
        alt="Textured Background" 
        fill 
        className="object-cover object-center z-0 opacity-90"
        priority 
        quality={100}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        
        {/* 2. The Liquid Black Logo */}
        <div className="relative w-full max-w-[280px] sm:max-w-md md:max-w-2xl h-32 sm:h-48 md:h-72 mb-10">
          <Image 
            src="/images/taest-logo-black.png" 
            alt="taest. logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 3. The Multilingual Accents */}
        <div className="flex justify-between w-full max-w-[240px] sm:max-w-[380px] md:max-w-[560px] text-2xl md:text-4xl font-bold mb-10 tracking-wider">
          <span className="text-[#54EB17]">टेस्ट</span>   {/* Hindi - Neon Green */}
          <span className="text-[#A855F7]">ٹیسٹ</span>    {/* Urdu - Purple */}
          <span className="text-[#EC4899]">ടേസ്റ്റ്</span>   {/* Malayalam - Pink */}
        </div>

        {/* 4. The Manifesto Text */}
        {/* Reduced max-w-3xl to max-w-xl, and decreased text sizes */}
        <p className="text-black text-sm sm:text-base md:text-lg leading-relaxed max-w-5xl font-medium text-balance mx-auto">
          A global social establishment to empower brands, founders, agencies, and production houses. We are designed to operate like the inner circle of the world's most relevant people. We offer plug & play creative and strategic leadership. All while building a thriving social circle for you, your brand and your clients.
        </p>
        
      </div>
    </section>
  );
}