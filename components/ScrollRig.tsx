'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import Loader from './Loader';

interface ScrollRigProps {
  children: ReactNode;
}

export default function ScrollRig({ children }: ScrollRigProps) {
  const [isSiteReady, setIsSiteReady] = useState(false);
  
  // Refs for our two independent video layers
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);

  // Lock document scrolling while the loader is active
  useEffect(() => {
    if (!isSiteReady) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isSiteReady]);

  // Master Gatekeeper (Tracks both videos before revealing)
  useEffect(() => {
    let isMounted = true;
    let bgReady = false;
    let fgReady = false;
    const startTime = Date.now(); 

    const checkReady = () => {
      if (bgReady && fgReady && isMounted) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 5000 - elapsed); // Enforce strict 5-second minimum

        setTimeout(() => { 
          if (isMounted) setIsSiteReady(true); 
        }, remaining);
      }
    };

    // Track Background Video
    const bgVid = bgVideoRef.current;
    if (bgVid && bgVid.readyState < 3) {
      bgVid.addEventListener('canplaythrough', () => {
        bgReady = true; 
        bgVid.play().catch(() => {}); 
        checkReady();
      }, { once: true });
    } else { bgReady = true; }

    // Track Foreground (Hello Card) Video
    const fgVid = fgVideoRef.current;
    if (fgVid && fgVid.readyState < 3) {
      fgVid.addEventListener('canplaythrough', () => {
        fgReady = true; 
        fgVid.play().catch(() => {}); 
        checkReady();
      }, { once: true });
    } else { fgReady = true; }

    checkReady(); // Initial check if assets are already cached

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

      {/* --- RESPONSIVE DUAL-VIDEO HERO LAYOUT --- */}
      <div className="relative w-full h-[100svh] overflow-hidden bg-black z-10 flex items-center justify-center">
        
        {/* Layer 1: Background Video (Fills screen, crops sides on mobile) */}
        <video
          ref={bgVideoRef}
          // Note: Removed the space from the filename "website-landscape-bg .mp4" for safety. 
          // Ensure your actual S3 filename exactly matches this string!
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-landscape-bg.mp4`}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        />

        {/* Layer 2: Foreground Title Card Video (Maintains 16:9, responsive width constraints) */}
        <div className="relative z-10 flex items-center justify-center pointer-events-none w-[90%] md:w-[60%] lg:w-[45%]">
          <video
            ref={fgVideoRef}
            src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/hello-taest-static-no-bg.mp4`}
            autoPlay
            muted
            loop
            playsInline
            // object-contain guarantees it will never overflow the wrapper boundaries
            className="w-full h-auto aspect-video object-contain drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          />
        </div>
        
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