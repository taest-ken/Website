'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './Loader';

interface ScrollRigProps {
  children: ReactNode;
}

export default function ScrollRig({ children }: ScrollRigProps) {
  const [isSiteReady, setIsSiteReady] = useState(false);
  
  // Refs for our two orientation-specific videos
  const landscapeVideoRef = useRef<HTMLVideoElement>(null);
  const portraitVideoRef = useRef<HTMLVideoElement>(null);

  // Lock document scrolling while the loader is active
  useEffect(() => {
    if (!isSiteReady) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isSiteReady]);

  // Master Gatekeeper (Strictly waits for active playback)
  useEffect(() => {
    let isMounted = true;

    // Determine which video is actively visible based on screen width
    const isDesktop = window.innerWidth >= 768;
    const activeVid = isDesktop ? landscapeVideoRef.current : portraitVideoRef.current;

    if (!activeVid) return;

    // The absolute truth: This only fires when pixels are actively moving on screen
    const handlePlaying = () => {
      if (isMounted) setIsSiteReady(true);
    };

    // Once enough of the video is loaded, force it to start playing
    const forcePlay = () => {
      activeVid.play().catch((err) => console.error("Autoplay prevented:", err));
    };

    // 1. If the video is somehow already actively playing, drop loader instantly
    if (!activeVid.paused && activeVid.currentTime > 0) {
      handlePlaying();
    } else {
      // 2. Attach the listener that will finally dismiss the loader
      activeVid.addEventListener('playing', handlePlaying, { once: true });
      
      // 3. Wait for the browser to cache enough data before pulling the trigger
      if (activeVid.readyState >= 3) {
        forcePlay();
      } else {
        activeVid.addEventListener('canplaythrough', forcePlay, { once: true });
      }
    }

    return () => {
      isMounted = false;
      if (activeVid) {
        activeVid.removeEventListener('playing', handlePlaying);
        activeVid.removeEventListener('canplaythrough', forcePlay);
      }
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isSiteReady && <Loader variant="hero" />}
      </AnimatePresence>

      {/* --- RESPONSIVE SINGLE-LAYER HERO LAYOUT --- */}
      <div className="relative w-full h-[100svh] overflow-hidden bg-black z-10 flex items-center justify-center">
        
        {/* LANDSCAPE VIDEO (Hidden on Mobile) */}
        <video
          ref={landscapeVideoRef}
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-landscape-static-optn.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto" // Forces browser to download the full file
          className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* PORTRAIT VIDEO (Hidden on Desktop) */}
        <video
          ref={portraitVideoRef}
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-portrait-static-option.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto" // Forces browser to download the full file
          className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
        />
        
      </div>

      {/* --- STATIC CONTENT --- */}
      <main
        id="static-content"
        className="bg-black min-h-screen relative z-20"
      >
        {children}
      </main>
    </>
  );
}