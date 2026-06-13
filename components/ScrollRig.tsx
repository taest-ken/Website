'use client';

import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import Loader from './Loader';

interface ScrollRigProps {
  children: ReactNode;
}

// Expanded breakpoints for a 500vh height to eliminate dead-zones
const P_SWAP_START = 0.15; // Loop starts fading out
const P_SWAP_END = 0.30;   // Clean swap complete
const P_SCRUB_END = 0.90;  // Canvas scrub finishes
const P_LOCK_END = 0.90;   // Handshake triggers exactly as scrub ends

const OUTRO_FRAME_COUNT = 5; // set to your actual extracted frame count

export default function ScrollRig({ children }: ScrollRigProps) {
  const isMobile = useIsMobile();
  const [isSiteReady, setIsSiteReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null); // New Mobile Portrait Video
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(-1);

  // Added precise offsets so 0-1 exactly matches the scrollable area, eliminating the black gap delay
  const { scrollYProgress } = useScroll({ 
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // DOM Cleanup
  const containerPointerEvents = useTransform(scrollYProgress, [0.999, 1], ['auto', 'none']);
  const containerVisibility = useTransform(scrollYProgress, [0.999, 1], ['visible', 'hidden']);

  const videoOpacity = useTransform(scrollYProgress, [0, P_SWAP_START, P_SWAP_END], [1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [P_SWAP_START, P_SWAP_END, P_LOCK_END, 1], [0, 1, 1, 1]);
  
  // Phase 2: Eradicate Hero Ghost
  const videoDisplay = useTransform(scrollYProgress, (v) => v > P_SWAP_END ? "none" : "block");

  // Handshake Transforms
  const stickyTranslateY = useTransform(scrollYProgress, [P_LOCK_END, 1], ['0vh', '-100vh']);
  const staticContentY = useTransform(scrollYProgress, [P_LOCK_END, 1], ['100vh', '0vh']);

  // Asset Loading
  const outroFrames = Array.from(
    { length: OUTRO_FRAME_COUNT },
    (_, i) => `${process.env.NEXT_PUBLIC_S3_BASE_URL}/frames/outro/frame_${String(i + 1).padStart(4, '0')}.png`
  );
  
  // Only attempt to load image sequence if not on mobile
  const hasImageSequence = outroFrames.length > 0 && !isMobile;

  // 1. Master Playback Controller (Desktop Only)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isMobile) return; // Mobile auto-loops natively now!
    const video = videoRef.current;
    if (video) {
      if (latest < P_SWAP_END) {
        if (video.readyState >= 3 && video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    }
  });

  // Lock document scrolling while the loader is active
  useEffect(() => {
    if (!isSiteReady) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isSiteReady]);

  // 2. Master Gatekeeper (Preloads Canvas Images + Tracks Video Buffering)
  useEffect(() => {
    let isMounted = true;
    let heroReady = false;
    let secondaryReady = false;
    const startTime = Date.now(); // Record exact mount time

    const checkReady = () => {
      if (heroReady && secondaryReady && isMounted) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 5000 - elapsed); // Enforce strict 3-second minimum

        setTimeout(() => { 
          if (isMounted) {
            // Pre-paint the very first frame of the canvas before the loader lifts!
            if (!isMobile) drawFrame(0);
            setIsSiteReady(true); 
          }
        }, remaining);
      }
    };

    // Track Canvas Images (Desktop) or Portrait Video (Mobile)
    if (isMobile) {
      const mobVid = mobileVideoRef.current;
      if (mobVid && mobVid.readyState < 3) {
        mobVid.addEventListener('canplaythrough', () => {
          heroReady = true; // Mobile only needs this one video!
          secondaryReady = true;
          checkReady();
        }, { once: true });
      } else { 
        heroReady = true;
        secondaryReady = true; 
      }
    } else {
      let loadedCount = 0;
      imagesRef.current = outroFrames.map((src, index) => {
        const img = new Image();
        const onLoadOrError = () => {
          loadedCount++;
          // If the first frame specifically finishes loading, paint it instantly behind the scenes
          if (index === 0 && isMounted) drawFrame(0);
          if (loadedCount === outroFrames.length) { secondaryReady = true; checkReady(); }
        };
        img.onload = onLoadOrError;
        img.onerror = onLoadOrError;
        img.src = src;
        return img;
      });
      if (outroFrames.length === 0) secondaryReady = true;
    }

    // Track Main Hero Video
    const heroVid = videoRef.current;
    if (heroVid && heroVid.readyState < 3) {
      heroVid.addEventListener('canplaythrough', () => {
        heroReady = true; heroVid.play().catch(() => {}); checkReady();
      }, { once: true });
    } else { heroReady = true; }

    checkReady(); // Initial check if assets are already cached

    // 6-second Safety Fallback (Forces open if user has a very bad connection)
    const fallback = setTimeout(() => { 
      if (isMounted) {
        if (!isMobile) drawFrame(0);
        setIsSiteReady(true); 
      }
    }, 6000);

    return () => { isMounted = false; clearTimeout(fallback); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // 3. Canvas Drawer (Desktop Only)
  const drawFrame = useCallback((frameIndex: number) => {
    if (isMobile) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[frameIndex];
    if (!img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
    };

    if (img.complete) draw();
    else img.onload = draw;
  }, [isMobile]);

  // 4. Smooth Scrubbing Logic (Desktop Only)
  const smoothFrame = useSpring(0, { stiffness: 150, damping: 25, restDelta: 0.5 });

  // Update the spring target based on scroll position
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isMobile || !imagesRef.current.length) return;
    
    const sequenceProgress = Math.max(
      0,
      Math.min(1, (latest - P_SWAP_END) / (P_SCRUB_END - P_SWAP_END)),
    );
    
    const targetFrame = Math.min(
      Math.floor(sequenceProgress * imagesRef.current.length),
      imagesRef.current.length - 1,
    );
    
    smoothFrame.set(targetFrame);
  });

  // Draw the frame whenever the spring ticks
  useMotionValueEvent(smoothFrame, 'change', (latest) => {
    const frameIndex = Math.round(latest);
    if (frameIndex !== lastFrameRef.current) {
      lastFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    }
  });

  // 6. Canvas Resize Observer
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (lastFrameRef.current >= 0) drawFrame(lastFrameRef.current);
    };

    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [drawFrame, isMobile]);

  return (
    <>
      <AnimatePresence>
        {!isSiteReady && <Loader variant="hero" />}
      </AnimatePresence>

      {isMobile ? (
        /* --- MOBILE LAYOUT (100svh Static Loop) --- */
        <div className="relative w-full h-[100svh] overflow-hidden bg-black z-10">
          <video
            ref={mobileVideoRef}
            src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-portrait-static-option.mp4`}
            autoPlay
            muted
            loop
            playsInline
            // object-cover ensures it perfectly fills the 9:16 screen
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        /* --- DESKTOP LAYOUT (500vh Scrub Rig) --- */
        <motion.div
          ref={containerRef}
          style={{
            height: '500vh',
            position: 'relative',
            pointerEvents: containerPointerEvents,
            visibility: containerVisibility,
          }}
        >
          <motion.div
            style={{
              position: 'sticky',
              top: 0,
              height: '100vh',
              width: '100%',
              overflow: 'hidden',
              translateY: stickyTranslateY,
            }}
          >
            <motion.video
              ref={videoRef}
              src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/hero-loop-optimized.mp4`}
              muted
              playsInline
              loop
              style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: videoOpacity,
                  display: videoDisplay,
                  zIndex: 1,
                }}
              />
            <motion.canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: outroOpacity,
                zIndex: 2,
                display: hasImageSequence ? 'block' : 'none',
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* STATIC CONTENT */}
      <motion.main
        id="static-content"
        className="bg-black min-h-screen relative z-20"
        // Desktop uses the negative margin overlap, Mobile flows naturally
        style={isMobile ? {} : { marginTop: '-100vh', y: staticContentY }}
      >
        {children}
      </motion.main>
    </>
  );
}