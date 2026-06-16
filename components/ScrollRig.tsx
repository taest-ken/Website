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

  // Master Gatekeeper (Waits for asset data with an autoplay deadlock safeguard)
  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now(); 

    // Determine which video is actively visible based on screen width
    const isDesktop = window.innerWidth >= 768;
    const activeVid = isDesktop ? landscapeVideoRef.current : portraitVideoRef.current;

    if (!activeVid) return;

    const handleVideoReady = () => {
      if (!isMounted) return;
      
      // Calculate how long it took the video file to initialize
      const elapsed = Date.now() - startTime;
      // Enforce the 5-second minimum timer so the animation finishes elegantly
      const remaining = Math.max(0, 5000 - elapsed); 

      setTimeout(() => {
        if (isMounted) {
          // Attempt to kick off loop playback cleanly
          activeVid.play().catch((err) => {
            console.warn("Autoplay engaged post-hydration framework safety:", err);
          });
          setIsSiteReady(true);
        }
      }, remaining);
    };

    // Trigger completion when the browser has loaded the current frame data
    if (activeVid.readyState >= 2) {
      handleVideoReady();
    } else {
      activeVid.addEventListener('loadeddata', handleVideoReady, { once: true });
      activeVid.addEventListener('canplay', handleVideoReady, { once: true });
    }

    // MAX SAFETY TIMEOUT: Forces the loader away after 10s if the network is congested
    const maxSafetyFallback = setTimeout(() => {
      if (isMounted && !isSiteReady) {
        console.log("Network congestion or autoplay restriction detected. Triggering safety override.");
        activeVid.play().catch(() => {});
        setIsSiteReady(true);
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(maxSafetyFallback);
      if (activeVid) {
        activeVid.removeEventListener('loadeddata', handleVideoReady);
        activeVid.removeEventListener('canplay', handleVideoReady);
      }
    };
  }, [isSiteReady]);

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