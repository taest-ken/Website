'use client';

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
} from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollRigProps {
  children: ReactNode;
}

// Condensed breakpoints for a 400vh height to prevent dead-zones
const P_SWAP_START = 0.25; // Loop starts fading out
const P_SWAP_END = 0.40;   // Clean swap complete
const P_SCRUB_END = 0.85;  // Canvas scrub finishes
const P_LOCK_END = 0.95;   // Rig pushes up

const OUTRO_FRAME_COUNT = 119; // set to your actual extracted frame count

export default function ScrollRig({ children }: ScrollRigProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const outroVideoRef = useRef<HTMLVideoElement>(null); // Fallback for mobile
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastFrameRef = useRef<number>(-1);

  const { scrollYProgress } = useScroll({ target: containerRef });

  // DOM Cleanup
  const containerPointerEvents = useTransform(scrollYProgress, [0.999, 1], ['auto', 'none']);
  const containerVisibility = useTransform(scrollYProgress, [0.999, 1], ['visible', 'hidden']);

  // Video & Canvas Opacities
  const videoOpacity = useTransform(scrollYProgress, [0, P_SWAP_START, P_SWAP_END], [1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [P_SWAP_START, P_SWAP_END, P_LOCK_END, 1], [0, 1, 1, 1]);

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

  // 1. Master Playback Controller
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Control Hero Loop
    const video = videoRef.current;
    if (video) {
      if (latest < P_SWAP_END) {
        if (video.readyState >= 3 && video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    }

    // Control Mobile Video Fallback
    if (isMobile) {
      const outroVideo = outroVideoRef.current;
      if (outroVideo) {
        if (latest >= P_SWAP_START && latest < P_LOCK_END) {
          if (outroVideo.readyState >= 3 && outroVideo.paused) outroVideo.play().catch(() => {});
        } else if (!outroVideo.paused) {
          outroVideo.pause();
        }
      }
    }
  });

  // 2. Preload Canvas Images (Desktop Only)
  useEffect(() => {
    if (isMobile || !outroFrames.length) return;
  
    const imgs = outroFrames.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  
    imagesRef.current = imgs;
    return () => {
      imagesRef.current = [];
    };
  }, [outroFrames, isMobile]);

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

  // 4. Scrubbing Logic (Desktop Only)
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (isMobile || !imagesRef.current.length) return;
    
    const sequenceProgress = Math.max(
      0,
      Math.min(1, (latest - P_SWAP_END) / (P_SCRUB_END - P_SWAP_END)),
    );
    
    const frameIndex = Math.min(
      Math.floor(sequenceProgress * imagesRef.current.length),
      imagesRef.current.length - 1,
    );
    
    if (frameIndex !== lastFrameRef.current) {
      lastFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    }
  });

  // 5. Initial Playback Hydration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    const onCanPlay = () => {
      if (video.readyState >= 3) video.play().catch(() => {});
    };
  
    if (video.readyState >= 3) onCanPlay();
    else video.addEventListener('canplay', onCanPlay, { once: true });
  
    return () => video.removeEventListener('canplay', onCanPlay);
  }, []);

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
      <motion.div
        ref={containerRef}
        style={{
          height: '400vh',
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
          {/* Phase 1: Looping Background */}
          <motion.video
            ref={videoRef}
            src="/videos/hero-loop-optimized.mp4"
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
              zIndex: 1,
            }}
          />

          {/* Phase 3: Mobile Fallback (Plays video instead of scrubbing) */}
          {isMobile ? (
            <motion.video
              ref={outroVideoRef}
              src="/videos/transition-outro-scrub.mp4"
              muted
              playsInline
              preload="auto"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: outroOpacity,
                zIndex: 2,
              }}
            />
          ) : (
            /* Phase 3: Desktop Canvas Scrub */
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
          )}
        </motion.div>
      </motion.div>

      {/* Phase 5: The Handshake */}
      <motion.main
        id="static-content"
        className="bg-black min-h-screen"
        style={{ marginTop: '-100vh', y: staticContentY }}
      >
        {children}
      </motion.main>
    </>
  );
}