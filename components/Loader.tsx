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
  
  // State Machine Hooks
  const [isUnlocked, setIsUnlocked] = useState(!isHero);
  const [canTap, setCanTap] = useState(!isHero);
  const [shockwave, setShockwave] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHero) {
      // Stage 1: Pause on frame 0, initialize unmuted readiness, start 1.0s offset timer
      video.loop = false;
      video.muted = false;
      video.defaultMuted = false;
      video.pause();

      const ignitionTimer = setTimeout(() => {
        setCanTap(true);
      }, 1000);
      return () => clearTimeout(ignitionTimer);
    } else {
      // Modal Behavior: Instant looping, strictly muted
      video.loop = true;
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch(() => {});
    }
  }, [isHero]);

  // Stage 2: Capture physical click/tap to bypass browser audio restrictions
  const handleUnlock = () => {
    if (!isHero || isUnlocked || !canTap) return;
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

    setShockwave(true);
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
        isHero ? "fixed inset-0 select-none" : "absolute inset-0 rounded-xl"
      } ${canTap && !isUnlocked ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* CIRCULAR VIDEO & RADIATING ENERGY RINGS */}
      <motion.div 
        layout // Smooth gravity re-centering when prompt dissolves
        className="relative flex items-center justify-center"
      >
        {/* Stage 1: Sonar Rings (Only emit after 1s offset when canTap activates) */}
        <AnimatePresence>
          {!isUnlocked && isHero && canTap && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.6, 0], scale: [1, 1.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-[#54EB17]/40 pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.6, 0], scale: [1, 1.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                className="absolute inset-0 rounded-full border border-[#54EB17]/20 pointer-events-none"
              />
            </>
          )}
        </AnimatePresence>

        {/* Stage 2: Acoustic Shockwave (Fires once upon tap) */}
        <AnimatePresence>
          {shockwave && (
            <motion.div
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => setShockwave(false)}
              className="absolute inset-0 rounded-full border-2 border-[#54EB17] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Stage 3: Core Circular Video Frame with 12-second Cinematic Slow-Zoom */}
        <motion.div
          animate={
            isHero
              ? isUnlocked
                ? { scale: [1, 1.65] } // Hyper-drive slow zoom over 12 seconds
                : {}
              : {}
          }
          transition={
            isUnlocked && isHero
              ? { duration: 12, ease: "linear" }
              : { duration: 0.3 }
          }
          className={`relative flex items-center justify-center overflow-hidden rounded-full transition-shadow duration-500 ${
            canTap && !isUnlocked && isHero
              ? "hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(84,235,23,0.3)]"
              : "shadow-[0_0_40px_rgba(84,235,23,0.15)]"
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
        </motion.div>
      </motion.div>

      {/* TYPOGRAPHY CAPTION / INTERACTIVE PROMPT */}
      <div className="relative inline-flex items-center justify-center text-center min-h-[48px]">
        <AnimatePresence mode="wait">
          {!isUnlocked && isHero ? (
            canTap ? (
              /* Stage 1: Delayed Interactive Tap Prompt */
              <motion.p
                key="tap-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ 
                  opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 0.4, ease: "easeOut" },
                  scale: { duration: 0.3 }
                }}
                className="font-sans font-bold tracking-[0.25em] text-[#54EB17] uppercase text-xs md:text-sm bg-[#54EB17]/10 px-6 py-3 rounded-full border border-[#54EB17]/30 shadow-[0_0_15px_rgba(84,235,23,0.1)] hover:bg-[#54EB17]/20 transition-colors"
              >
                [ Tap to pull the lever ]
              </motion.p>
            ) : null
          ) : (
            /* Stage 3: Active Loading / Playing Status */
            <motion.div
              key="loading-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
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