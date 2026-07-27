"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  variant?: "hero" | "modal";
}

// Internal micro-component for smooth trailing dots
const AnimatedDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
};

export default function Loader({ variant = "hero" }: LoaderProps) {
  const isHero = variant === "hero";
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force hardware autoplay on mount to prevent browser hydration freezes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn("Loader video autoplay blocked:", err);
      });
    }
  }, []);

  return (
    <motion.div
      key="global-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`z-[999] flex flex-col items-center justify-center gap-6 bg-black/95 backdrop-blur-2xl ${
        isHero ? "fixed inset-0" : "absolute inset-0 rounded-xl"
      }`}
    >
      {/* Circular Video Container */}
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-full shadow-[0_0_40px_rgba(84,235,23,0.15)] ${
          isHero ? "w-48 h-48 md:w-64 md:h-64" : "w-24 h-24 md:w-32 md:h-32"
        }`}
      >
        <video
          ref={videoRef}
          src="/assets/loader.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-[1.15]"
        />
      </div>

      {/* Perfectly Centered Brand Typography */}
      <div className="relative inline-flex items-center justify-center select-none">
        <p className={`font-sans font-bold tracking-[0.25em] text-[#54EB17] uppercase ${
          isHero ? "text-sm md:text-base" : "text-xs md:text-sm"
        }`}>
          L o a d i n g
        </p>
        
        {/* Absolute positioning lets dots animate without shifting the center balance */}
        <span className={`absolute left-full ml-1 font-sans font-bold tracking-[0.1em] text-[#54EB17] text-left w-6 ${
          isHero ? "text-sm md:text-base" : "text-xs md:text-sm"
        }`}>
          <AnimatedDots />
        </span>
      </div>
    </motion.div>
  );
}