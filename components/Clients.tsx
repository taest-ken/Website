"use client";

import Image from "next/image";
import { useRef } from "react";

// Update these paths to match exactly what you name your files in the public/clients_media folder
const clients = [
  { name: "Birla Estates", src: "/clients_media/birla-estates.svg", scale: "scale-130" },
  { name: "Gujarat Titans", src: "/clients_media/gujarat-titans.png", scale: "scale-140" },
  { name: "Google", src: "/clients_media/google.svg", scale: "scale-90" },
  { name: "Procter & Gamble", src: "/clients_media/pg.png", scale: "scale-125" },
  { name: "Trailer Park Group", src: "/clients_media/trailer-park-group.png", scale: "scale-160" },
  { name: "Sparkt LLP", src: "/clients_media/sparkt.png", scale: "scale-170" },
  { name: "White Turtle Studios", src: "/clients_media/white-turtle.png", scale: "scale-150" }
];

export default function Clients() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveringLogo = useRef(false);

  // Helper to cleanly update all active animation tracks
  const updatePlaybackRate = (rate: number) => {
    if (!containerRef.current) return;
    const tracks = containerRef.current.querySelectorAll('.animate-marquee');
    tracks.forEach((track) => {
      track.getAnimations().forEach((anim) => {
        anim.playbackRate = rate;
      });
    });
  };

  // Dynamically alters the speed of the running CSS animation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (isHoveringLogo.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - left;
    const hoverRatio = cursorX / width;

    let playbackRate = 1; // Default speed
    if (hoverRatio < 0.2 || hoverRatio > 0.8) {
      playbackRate = 4; 
    }

    updatePlaybackRate(playbackRate);
  };

  const handleMouseLeave = () => {
    updatePlaybackRate(1);
  };

  const handleLogoEnter = () => {
    isHoveringLogo.current = true;
    updatePlaybackRate(0); // Hard Pause
  };

  const handleLogoLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    isHoveringLogo.current = false;
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

      {/* Interactive Container: overflow-hidden kills the scrollbar, py-12 gives room for scale-160 */}
      <div className="relative flex overflow-hidden py-12">
        
        {/* Track 1 */}
        <div className="animate-marquee w-max flex items-center shrink-0">
          {/* 4 loops guarantees it is wider than any 4K screen */}
          {[...clients, ...clients, ...clients, ...clients].map((client, index) => (
            <div 
              key={`t1-${client.name}-${index}`}
              onMouseEnter={handleLogoEnter}
              onMouseLeave={handleLogoLeave}
              className="relative h-16 md:h-24 lg:h-28 flex-shrink-0 flex items-center justify-center pr-24 md:pr-32 lg:pr-48"
            >
              <img 
                src={client.src} 
                alt={`${client.name} logo`} 
                className={`h-full w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer ${client.scale || "scale-100"}`}
              />
            </div>
          ))}
        </div>

        {/* Track 2 (Exact visual duplicate seamlessly following Track 1) */}
        <div className="animate-marquee w-max flex items-center shrink-0" aria-hidden="true">
          {[...clients, ...clients, ...clients, ...clients].map((client, index) => (
            <div 
              key={`t2-${client.name}-${index}`}
              onMouseEnter={handleLogoEnter}
              onMouseLeave={handleLogoLeave}
              className="relative h-16 md:h-24 lg:h-28 flex-shrink-0 flex items-center justify-center pr-24 md:pr-32 lg:pr-48"
            >
              <img 
                src={client.src} 
                alt={`${client.name} logo`} 
                className={`h-full w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer ${client.scale || "scale-100"}`}
              />
            </div>
          ))}
        </div>

      </div>

      {/* 60fps GPU-accelerated CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); } /* A perfect seamless slide */
        }
        .animate-marquee {
          /* 40s is slow enough to read, fast enough to feel alive */
          animation: marquee 80s linear infinite; 
        }
        /* REMOVED: .animate-marquee:hover { animation-play-state: paused; } */
        /* JS now handles pausing so it doesn't conflict with the playbackRate logic */
      `}</style>
    </section>
  );
}