"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  variant?: "hero" | "modal";
  onFinish?: () => void;
  progress?: number;
}

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

export default function Loader({ variant = "hero", onFinish, progress }: LoaderProps) {
  const isHero = variant === "hero";
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Modal automatically starts unlocked; Hero waits for physical interaction
  const [isUnlocked, setIsUnlocked] = useState(!isHero);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHero) {
      // 1. HERO BEHAVIOR: Prepare for 12-second unmuted play, but pause on frame 0 until tapped
      video.loop = false;
      video.muted = false;
      video.defaultMuted = false;
      video.pause();
    } else {
      // 2. MODAL BEHAVIOR: Instant looping, strictly muted
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    }
  }, [isHero]);

  // Captures physical click/tap to bypass browser audio restrictions
  const handleUnlock = () => {
    if (!isHero || isUnlocked) return;
    const video = videoRef.current;
    
    if (video) {
      video.muted = false;
      video.defaultMuted = false;
      video.play().catch((err) => {
        console.warn("Unmuted playback blocked, falling back to muted:", err);
        video.muted = true;
        video.play().catch(() => {});
      });
    }
    setIsUnlocked(true);
  };

  return (
    <motion.div
      key="global-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onClick={handleUnlock}
      className={`z-[999] flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-2xl ${
        isHero ? "fixed inset-0 cursor-pointer select-none" : "absolute inset-0 rounded-xl"
      }`}
    >
      {/* CIRCULAR VIDEO & RADIATING ENERGY RINGS */}
      <div className="relative flex items-center justify-center">
        
        {/* Emanating Sonar Rings (Only visible on Hero before tap) */}
        <AnimatePresence>
          {!isUnlocked && isHero && (
            <>
              <motion.div
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-[#54EB17]/40 pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.6, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="absolute inset-0 rounded-full border border-[#54EB17]/20 pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>

        {/* Core Circular Video Frame */}
        <div 
          className={`relative flex items-center justify-center overflow-hidden rounded-full transition-transform duration-500 ${
            !isUnlocked && isHero ? "hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(84,235,23,0.3)]" : "shadow-[0_0_40px_rgba(84,235,23,0.15)]"
          } ${
            isHero ? "w-48 h-48 md:w-64 md:h-64" : "w-24 h-24 md:w-32 md:h-32"
          }`}
        >
          <video
            ref={videoRef}
            src={isHero ? "/assets/land-loader.mp4" : "/assets/loader.mp4"}
            playsInline
            preload="auto"
            onEnded={() => {
              if (isHero && onFinish) onFinish();
            }}
            className="w-full h-full object-cover scale-[1.15]"
          />
        </div>
      </div>

      {/* TYPOGRAPHY CAPTION / INTERACTIVE PROMPT */}
      <div className="relative inline-flex items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {!isUnlocked && isHero ? (
            /* Interactive Tap Prompt */
            <motion.p
              key="tap-prompt"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="font-sans font-bold tracking-[0.25em] text-[#54EB17] uppercase text-xs md:text-sm bg-[#54EB17]/10 px-6 py-3 rounded-full border border-[#54EB17]/30 shadow-[0_0_15px_rgba(84,235,23,0.1)] hover:bg-[#54EB17]/20 transition-colors"
            >
              [ Tap to pull the lever ]
            </motion.p>
          ) : (
            /* Standard Active Loading / Playing Status */
            <motion.div
              key="loading-status"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative inline-flex items-center justify-center"
            >
              <p className={`font-sans font-bold tracking-[0.25em] text-[#54EB17] uppercase ${
                isHero ? "text-sm md:text-base" : "text-xs md:text-sm"
              }`}>
                {progress !== undefined && progress > 0 ? `Loading ${progress}%` : "Loading"}
              </p>
              
              <span className={`absolute left-full ml-1 font-sans font-bold tracking-[0.1em] text-[#54EB17] text-left w-6 ${
                isHero ? "text-sm md:text-base" : "text-xs md:text-sm"
              }`}>
                <AnimatedDots />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}