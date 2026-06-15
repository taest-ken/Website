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

  // Master Gatekeeper (Tracks the active video based on screen size)
  useEffect(() => {
    let isMounted = true;
    let videoReady = false;
    const startTime = Date.now(); 

    const checkReady = () => {
      if (videoReady && isMounted) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 5000 - elapsed); // Enforce strict 5-second minimum

        setTimeout(() => { 
          if (isMounted) setIsSiteReady(true); 
        }, remaining);
      }
    };

    // Determine which video is actively being displayed based on CSS breakpoints (md = 768px)
    const isDesktop = window.innerWidth >= 768;
    const activeVid = isDesktop ? landscapeVideoRef.current : portraitVideoRef.current;

    if (activeVid && activeVid.readyState < 3) {
      activeVid.addEventListener('canplaythrough', () => {
        videoReady = true; 
        activeVid.play().catch(() => {}); 
        checkReady();
      }, { once: true });
    } else { 
      videoReady = true; 
      checkReady(); 
    }

    // 6-second Safety Fallback
    const fallback = setTimeout(() => { 
      if (isMounted) setIsSiteReady(true); 
    }, 6000);

    return () => { isMounted = false; clearTimeout(fallback); };
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
          // TODO: Replace with your actual 16:9 flattened video filename
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-landscape-static-optn.mp4`}
          autoPlay
          muted
          loop
          playsInline
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