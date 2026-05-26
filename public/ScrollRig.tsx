'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
} from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ScrollRigProps {
  /** Ordered array of image URLs used for the canvas image-sequence (Phase 3). */
  frames: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const NEON_GREEN = '#54EB17';
const TAEST_PINK = '#FF2782';

// Phase breakpoints (scroll progress 0 → 1)
const P1_END = 0.2;   // 0 – 20 %
const P2_END = 0.4;   // 20 – 40 %
const P3_END = 0.7;   // 40 – 70 %
const P4_END = 0.9;   // 70 – 90 %
                       // 90 – 100 % = Phase 5

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ScrollRig({ frames }: ScrollRigProps) {
  // ── Refs ────────────────────────────────────────────────────────────────
  const containerRef   = useRef<HTMLDivElement>(null);
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const imagesRef      = useRef<HTMLImageElement[]>([]);
  const lastFrameRef   = useRef<number>(-1);

  // ── Scroll Progress ──────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({ target: containerRef });

  // ── Derived Motion Values ────────────────────────────────────────────────

  // -- Outer container: hide + kill pointer events after 100 %
  const containerPointerEvents = useTransform(
    scrollYProgress,
    [0.999, 1],
    ['auto', 'none'],
  );
  const containerVisibility = useTransform(
    scrollYProgress,
    [0.999, 1],
    ['visible', 'hidden'],
  );

  // -- Phase 1: video opacity (full during 0-20%, fades out 40-70%)
  const videoOpacity = useTransform(
    scrollYProgress,
    [0, P1_END, P2_END, P3_END],
    [1,      1,      1,       0],
  );

  // -- Phase 2: Tape 1 (Neon Green) – enters from bottom, 20-40 %
  const tape1Opacity = useTransform(
    scrollYProgress,
    [P1_END, P1_END + 0.05, P2_END, P3_END],
    [0,                  1,      1,      0],
  );
  const tape1Y = useTransform(
    scrollYProgress,
    [P1_END, P1_END + 0.05],
    ['100%', '0%'],
  );

  // -- Phase 3: canvas opacity
  const canvasOpacity = useTransform(
    scrollYProgress,
    [P2_END, P2_END + 0.05, P3_END, P4_END],
    [0,                  1,      1,      1],
  );

  // -- Phase 4: Tape 2 (Taest Pink) – enters from bottom, 70-90 %
  const tape2Opacity = useTransform(
    scrollYProgress,
    [P3_END, P3_END + 0.05, P4_END, 0.95],
    [0,                  1,      1,     0],
  );
  const tape2Y = useTransform(
    scrollYProgress,
    [P3_END, P3_END + 0.05],
    ['100%', '0%'],
  );

  // -- Phase 5: slide the entire sticky rig out of view (90-100 %)
  const stickyTranslateY = useTransform(
    scrollYProgress,
    [P4_END, 1],
    ['0vh', '-100vh'],
  );

  // ── Video play/pause ─────────────────────────────────────────────────────
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const video = videoRef.current;
    if (!video) return;

    if (latest < P2_END) {
      // Phase 1 – keep playing
      if (video.readyState >= 3 && video.paused) {
        video.play().catch(() => {/* autoplay policy – swallow */});
      }
    } else {
      // Pause outside Phase 1
      if (!video.paused) video.pause();
    }
  });

  // ── Image sequence pre-load ───────────────────────────────────────────────
  useEffect(() => {
    if (!frames.length) return;

    const imgs = frames.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    imagesRef.current = imgs;

    return () => {
      imagesRef.current = [];
    };
  }, [frames]);

  // ── Canvas renderer ───────────────────────────────────────────────────────
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[frameIndex];
    if (!img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Cover-fit the image inside the canvas
      const { width: cw, height: ch } = canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = img.naturalWidth  * scale;
      const sh = img.naturalHeight * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh);
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!frames.length) return;

    // Map progress 20-70% to frame indices
    const sequenceProgress = Math.max(
      0,
      Math.min(1, (latest - P2_END) / (P3_END - P2_END)),
    );
    const frameIndex = Math.min(
      Math.floor(sequenceProgress * frames.length),
      frames.length - 1,
    );

    if (frameIndex !== lastFrameRef.current) {
      lastFrameRef.current = frameIndex;
      drawFrame(frameIndex);
    }
  });

  // ── Canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-draw current frame after resize
      if (lastFrameRef.current >= 0) drawFrame(lastFrameRef.current);
    };

    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [drawFrame]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    /*
     * Outer 600vh container – this is what the user scrolls through.
     * Once scroll hits 100 % we kill pointer-events + visibility via
     * useTransform so nothing beneath is blocked.
     */
    <motion.div
      ref={containerRef}
      style={{
        height: '600vh',
        position: 'relative',
        pointerEvents: containerPointerEvents,
        visibility: containerVisibility,
      }}
    >
      {/* ── Sticky Rig ── */}
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

        {/* ── PHASE 1 · Hero Loop Video ── */}
        <motion.video
          ref={videoRef}
          src="/videos/hero-loop.mp4"
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
          }}
        />

        {/* ── PHASE 3 · Canvas Image Sequence ── */}
        <motion.canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: canvasOpacity,
          }}
        />

        {/* ── PHASE 2 · Tape Overlay 1 – Neon Green ── */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'hidden',
            opacity: tape1Opacity,
            y: tape1Y,
          }}
        >
          <TapeStrip
            color={NEON_GREEN}
            textColor="#0a0a0a"
            text="Earn tomorrow's currency today"
          />
        </motion.div>

        {/* ── PHASE 4 · Tape Overlay 2 – Taest Pink ── */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            overflow: 'hidden',
            opacity: tape2Opacity,
            y: tape2Y,
          }}
        >
          <TapeStrip
            color={TAEST_PINK}
            textColor="#ffffff"
            text="Global Social Club — Brands, Agencies, Creatives"
          />
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: TapeStrip
// ---------------------------------------------------------------------------
interface TapeStripProps {
  color: string;
  textColor: string;
  text: string;
}

function TapeStrip({ color, textColor, text }: TapeStripProps) {
  // Repeat the text so it fills the stripe at any viewport width
  const repeated = Array(6).fill(text).join('  ·  ');

  return (
    <div
      style={{
        backgroundColor: color,
        color: textColor,
        padding: '18px 0',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        /* Slight tilt – classic tape aesthetic */
        transform: 'rotate(-1.5deg) scaleX(1.04)',
        transformOrigin: 'center',
        boxShadow: `0 -4px 0 ${textColor}22, 0 4px 0 ${textColor}22`,
      }}
    >
      <span
        style={{
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          fontWeight: 900,
          fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          userSelect: 'none',
        }}
      >
        {repeated}
      </span>
    </div>
  );
}
