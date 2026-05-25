"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type MediaType = "image" | "video";
export interface Media {
  type: MediaType;
  src: string;
}

export default function MediaModal({ media, onClose }: { media: Media[]; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // New Mute State
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = useCallback(() => setActiveIdx((p) => (p + 1) % media.length), [media.length]);
  const handlePrev = useCallback(() => setActiveIdx((p) => (p - 1 + media.length) % media.length), [media.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
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
    >
      <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-neon-green z-10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>

      <div className="relative w-full max-w-6xl aspect-video bg-black/50 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full flex items-center justify-center">
            {currentMedia.type === "video" ? (
              <video ref={videoRef} src={currentMedia.src} autoPlay muted={isMuted} onTimeUpdate={handleTimeUpdate} onEnded={handleNext} className="max-w-full max-h-full" />
            ) : (
              <Image src={currentMedia.src} alt="Media" fill className="object-contain" />
            )}
          </motion.div>
        </AnimatePresence>

        {currentMedia.type === "video" && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4">
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
        <>
          <button onClick={handlePrev} className="absolute left-4 md:left-12 text-white/50 hover:text-neon-green p-4"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button onClick={handleNext} className="absolute right-4 md:right-12 text-white/50 hover:text-neon-green p-4"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
        </>
      )}
    </motion.div>
  );
}