"use client";

import Image from "next/image";
import { useRef } from "react";

// Update these paths to match exactly what you name your files in the public/clients_media folder
const clients = [
  { name: "Birla Estates", src: "/clients_media/birla-estates.svg" },
  { name: "Gujarat Titans", src: "/clients_media/gujarat-titans.png" },
  { name: "Google", src: "/clients_media/google.svg" },
  { name: "Procter & Gamble", src: "/clients_media/pg.png" },
  { name: "Trailer Park Group", src: "/clients_media/trailer-park-group.png" },
  { name: "Sparkt LLP", src: "/clients_media/sparkt.png" },
  { name: "White Turtle Studios", src: "/clients_media/white-turtle.png" }
];

export default function Clients() {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null); // New ref specifically for the scrolling animation
  const isHoveringLogo = useRef(false);

  // Dynamically alters the speed of the running CSS animation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !marqueeRef.current) return;
    
    // UX OVERRIDE: If directly hovering a logo, keep it paused (0). Do not fast-forward.
    if (isHoveringLogo.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - left;
    const hoverRatio = cursorX / width;

    let playbackRate = 1; // Default speed
    
    // If hovering the left 20% or right 20% of the container, speed up 4x
    if (hoverRatio < 0.2 || hoverRatio > 0.8) {
      playbackRate = 4; 
    }

    // Apply the time manipulation ONLY to the marquee wrapper
    marqueeRef.current.getAnimations().forEach((anim) => {
      anim.playbackRate = playbackRate;
    });
  };

  const handleMouseLeave = () => {
    if (!marqueeRef.current) return;
    // Reset to normal speed when the mouse leaves the section entirely
    marqueeRef.current.getAnimations().forEach((anim) => {
      anim.playbackRate = 1;
    });
  };

  const handleLogoEnter = () => {
    isHoveringLogo.current = true;
    if (marqueeRef.current) {
      marqueeRef.current.getAnimations().forEach((anim) => {
        anim.playbackRate = 0; // Hard Pause
      });
    }
  };

  const handleLogoLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    isHoveringLogo.current = false;
    // Re-evaluate mouse position immediately so it resumes at the correct edge/center speed
    handleMouseMove(e as unknown as React.MouseEvent<HTMLDivElement>);
  };

  return (
    <section 
      id="clients" 
      className="py-24 bg-black overflow-hidden border-y border-dark-grey cursor-default"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
        <span className="text-xs uppercase tracking-widest text-neon-green font-medium">
          Network
        </span>
        <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">
          Clients
        </h2>
      </div>

      {/* Interactive Container that tracks the mouse */}
      <div className="relative flex overflow-x-hidden py-8">
        {/* The marquee wrapper */}
        {/* Added strict gap spacing here instead of relying on margins */}
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24 lg:gap-32" ref={marqueeRef}>
          {/* We duplicate the list to create the infinite illusion */}
          {[...clients, ...clients, ...clients].map((client, index) => (
            <div 
              key={`${client.name}-${index}`}
              onMouseEnter={handleLogoEnter}
              onMouseLeave={handleLogoLeave}
              // Removed fixed widths, adjusted height, and let width be auto-calculated
              className="relative h-16 md:h-24 lg:h-28 flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer flex items-center justify-center"
            >
              {/* Native img tag handles dynamic w-auto perfectly compared to Next.js strict fill bounding boxes */}
              <img 
                src={client.src} 
                alt={`${client.name} logo`} 
                className="h-full w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 60fps GPU-accelerated CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.33%); } /* Adjusted for 3x duplication */
        }
        .animate-marquee {
          /* 40s is slow enough to read, fast enough to feel alive */
          animation: marquee 40s linear infinite; 
        }
        /* REMOVED: .animate-marquee:hover { animation-play-state: paused; } */
        /* JS now handles pausing so it doesn't conflict with the playbackRate logic */
      `}</style>
    </section>
  );
}