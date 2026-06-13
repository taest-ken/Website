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
  const [isMediaReady, setIsMediaReady] = useState(false); // ADDED: Media Loading State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Auto-hide after 3 seconds if playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Ensure controls pop back up if the video is paused
  useEffect(() => {
    if (!isPlaying) showControls();
  }, [isPlaying, showControls]);

  // UPDATED: Reset isMediaReady to false immediately when changing files!
  const handleNext = useCallback(() => {
    setIsMediaReady(false);
    setActiveIdx((p) => (p + 1) % media.length);
  }, [media.length]);
  
  const handlePrev = useCallback(() => {
    setIsMediaReady(false);
    setActiveIdx((p) => (p - 1 + media.length) % media.length);
  }, [media.length]);

  useEffect(() => {
    // 1. Tell the Header to slide up and hide
    window.dispatchEvent(new Event("modalOpen"));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // 2. Tell the Header to slide back down
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
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) videoRef.current.currentTime += amount;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
      onMouseMove={showControls}
    >
      {/* PHASE 2: RED ZONES - Invisible absolute sidebars for closing */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 z-10 cursor-pointer" onClick={onClose} />
      <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 z-10 cursor-pointer" onClick={onClose} />

      {/* PHASE 2: GREEN ZONE - The entire main container acts as a play/pause toggle */}
      <div 
        className="relative w-full max-w-6xl aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer"
        onMouseLeave={() => isPlaying && setIsControlsVisible(false)}
        onClick={() => {
          showControls();
          if (currentMedia.type === "video") togglePlay();
        }}
      >
        {/* Inner Close Button (Stop propagation so clicking the cross doesn't pause the video!) */}
        <div 
          className={`absolute top-4 right-4 z-50 transition-opacity duration-500 ${isControlsVisible || currentMedia.type === "image" ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:text-neon-green transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full flex items-center justify-center">
            
            {/* Phase 3: The Micro-Loader (Trapped securely inside the modal container) */}
            <AnimatePresence>
              {!isMediaReady && <Loader variant="modal" />}
            </AnimatePresence>

            {currentMedia.type === "video" ? (
              <video 
                ref={videoRef} 
                src={currentMedia.src} 
                autoPlay 
                muted={isMuted} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleNext} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                // Tells the modal the browser has buffered enough video data to play!
                onCanPlay={() => setIsMediaReady(true)}
                className={`max-w-full max-h-full transition-opacity duration-500 ${isMediaReady ? 'opacity-100' : 'opacity-0'}`} 
              />
            ) : (
              <Image 
                src={currentMedia.src} 
                alt="Media" 
                fill 
                className={`object-contain transition-opacity duration-500 ${isMediaReady ? 'opacity-100' : 'opacity-0'}`}
                // Tells the modal the browser has completely downloaded the image!
                onLoad={() => setIsMediaReady(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {currentMedia.type === "video" && (
          // Added showControls() so interacting with any bottom controls resets the inactivity timer
          <div 
            className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4 transition-opacity duration-500 z-40 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => { e.stopPropagation(); showControls(); }}
          >
            <div className="w-full h-1 bg-white/20 rounded cursor-pointer" onClick={handleSeek}>
              <div className="h-full bg-neon-green rounded" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-center gap-8 text-white">
              <button onClick={() => skip(-5)} className="hover:text-neon-green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg></button>
              <button onClick={togglePlay} className="hover:text-neon-green">
                {isPlaying ? <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>}
              </button>
              <button onClick={() => skip(5)} className="hover:text-neon-green"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg></button>
              
              {/* Mute Toggle Button */}
              <button onClick={toggleMute} className="hover:text-neon-green ml-4">
                {isMuted ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {media.length > 1 && (
        // FIXED: Using 'absolute inset-0 pointer-events-none' stretches this layer across the whole screen!
        <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 ${isControlsVisible || currentMedia.type === "image" ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={(e) => { e.stopPropagation(); showControls(); handlePrev(); }} 
            // FIXED: Added pointer-events-auto so clicks register, and kept the massive blue zone hitboxes
            className="pointer-events-auto absolute left-0 md:left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-neon-green p-12 md:p-16"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); showControls(); handleNext(); }} 
            // FIXED: Added pointer-events-auto so clicks register, and kept the massive blue zone hitboxes
            className="pointer-events-auto absolute right-0 md:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-neon-green p-12 md:p-16"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </motion.div>
  );
}