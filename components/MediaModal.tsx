"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Loader from "./Loader";

export type MediaType = "image" | "video";
export interface Media {
  type: MediaType;
  src: string;
}

export default function MediaModal({ media, onClose }: { media: Media[]; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) showControls();
  }, [isPlaying, showControls]);

  const handleNext = useCallback(() => {
    setIsMediaReady(false);
    setActiveIdx((p) => (p + 1) % media.length);
  }, [media.length]);
  
  const handlePrev = useCallback(() => {
    setIsMediaReady(false);
    setActiveIdx((p) => (p - 1 + media.length) % media.length);
  }, [media.length]);

  // Handle Fullscreen & Screen Orientation Lock (Module 4)
  const toggleFullscreen = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!playerContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        // Enter Fullscreen on Container
        if (playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          await (playerContainerRef.current as any).webkitRequestFullscreen();
        } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
          // iOS Safari Native Video Fallback
          (videoRef.current as any).webkitEnterFullscreen();
          return;
        }

        // Lock Orientation to Landscape for Mobile Phones
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock("landscape").catch(() => {
            // Silently ignore if browser denies orientation locking on desktop
          });
        }
      } else {
        // Exit Fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }

        // Unlock Screen Orientation back to standard vertical website view
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.warn("Fullscreen or Orientation Error:", err);
    }
  };

  // Listen for native system fullscreen changes (e.g., hitting Escape or back swipe)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(isFull);
      
      // Auto-unlock orientation if user exits via system back button
      if (!isFull && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event("modalOpen"));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) toggleFullscreen();
        else onClose();
      }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.dispatchEvent(new Event("modalClose"));
    };
  }, [handleNext, handlePrev, onClose]);

  if (!media || media.length === 0) return null;
  const currentMedia = media[activeIdx];

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, clickX / rect.width));
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const skip = (amount: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) videoRef.current.currentTime += amount;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-8 select-none"
      onMouseMove={showControls}
    >
      {/* MODULE 3: UNIVERSAL FIXED CLOSE (X) BUTTON ANCHOR */}
      {/* Detached from relative containers so it stays glued to extreme top-right on laptops & vertical phones */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[200]">
        <button 
          onClick={() => {
            if (document.fullscreenElement) toggleFullscreen();
            onClose();
          }} 
          className="p-3 sm:p-3.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-white hover:text-[#54EB17] transition-all transform hover:scale-110 active:scale-95 shadow-xl flex items-center justify-center"
          aria-label="Close modal"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Invisible sidebar hitboxes for clicking out */}
      <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 z-10 cursor-pointer" onClick={onClose} />
      <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 z-10 cursor-pointer" onClick={onClose} />

      {/* MAIN MEDIA PLAYER CONTAINER */}
      <div 
        ref={playerContainerRef}
        className="relative w-full max-w-6xl aspect-video bg-black/60 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer border border-white/10"
        onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
        onClick={() => {
          showControls();
          if (currentMedia.type === "video") togglePlay();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeIdx} 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }} 
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* MODULE 2: MICRO-LOADER (Surfaces automatically on network buffer stalls) */}
            <AnimatePresence>
              {!isMediaReady && <Loader variant="modal" />}
            </AnimatePresence>

            {currentMedia.type === "video" ? (
              <video 
                ref={videoRef} 
                src={currentMedia.src} 
                autoPlay 
                playsInline
                muted={isMuted} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleNext} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                // MODULE 2: Event-Driven Buffer Synchronization
                onCanPlay={() => setIsMediaReady(true)}
                onPlaying={() => setIsMediaReady(true)}
                onWaiting={() => setIsMediaReady(false)}
                onStalled={() => setIsMediaReady(false)}
                className={`max-w-full max-h-full transition-opacity duration-500 ${isMediaReady ? 'opacity-100' : 'opacity-0'}`} 
              />
            ) : (
              <Image 
                src={currentMedia.src} 
                alt="Media" 
                fill 
                className={`object-contain transition-opacity duration-500 ${isMediaReady ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setIsMediaReady(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM CONTROL BAR (Optimized mobile vertical geometry) */}
        {currentMedia.type === "video" && (
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3 sm:gap-4 transition-opacity duration-500 z-40 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => { e.stopPropagation(); showControls(); }}
          >
            {/* Seek Bar */}
            <div className="w-full h-1.5 sm:h-1 bg-white/20 hover:h-2 rounded cursor-pointer transition-all overflow-hidden" onClick={handleSeek}>
              <div className="h-full bg-[#54EB17] rounded" style={{ width: `${progress}%` }} />
            </div>

            {/* Navigation & Controls */}
            <div className="flex items-center justify-between text-white w-full px-1">
              {/* Left Spacer / Time display placeholder */}
              <div className="flex items-center gap-2 text-xs font-mono text-white/70 w-20">
                {videoRef.current && !isNaN(videoRef.current.duration) ? (
                  <span>
                    {Math.floor(videoRef.current.currentTime / 60)}:{Math.floor(videoRef.current.currentTime % 60).toString().padStart(2, "0")} / {Math.floor(videoRef.current.duration / 60)}:{Math.floor(videoRef.current.duration % 60).toString().padStart(2, "0")}
                  </span>
                ) : null}
              </div>

              {/* Center Playback Controls */}
              <div className="flex items-center justify-center gap-6 sm:gap-8">
                <button onClick={(e) => skip(-5, e)} className="hover:text-[#54EB17] transition-colors p-1" aria-label="Rewind 5 seconds">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
                </button>
                
                <button onClick={(e) => togglePlay(e)} className="hover:text-[#54EB17] transition-colors p-2 bg-white/10 rounded-full active:scale-95" aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                  )}
                </button>
                
                <button onClick={(e) => skip(5, e)} className="hover:text-[#54EB17] transition-colors p-1" aria-label="Fast forward 5 seconds">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
                </button>
              </div>
              
              {/* Right Utility Controls (Mute + Fullscreen) */}
              <div className="flex items-center justify-end gap-3 sm:gap-4 w-20">
                <button onClick={(e) => toggleMute(e)} className="hover:text-[#54EB17] transition-colors p-1.5" aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  )}
                </button>

                {/* MODULE 4: FULLSCREEN & ORIENTATION TOGGLE */}
                <button onClick={(e) => toggleFullscreen(e)} className="hover:text-[#54EB17] transition-colors p-1.5" aria-label="Toggle fullscreen">
                  {isFullscreen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MULTI-MEDIA CAROUSEL ARROWS */}
      {media.length > 1 && (
        <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 ${isControlsVisible || currentMedia.type === "image" ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); showControls(); handlePrev(); }} 
            className="pointer-events-auto absolute left-0 md:left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#54EB17] p-8 md:p-16 transition-colors"
            aria-label="Previous media"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); showControls(); handleNext(); }} 
            className="pointer-events-auto absolute right-0 md:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#54EB17] p-8 md:p-16 transition-colors"
            aria-label="Next media"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}