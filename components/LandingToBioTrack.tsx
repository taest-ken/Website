"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Loader from "./Loader";

export default function LandingToBioTrack() {
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // ────────────────────────────────────────────────────────────────────────────
  // LOADER & ASSET STATE MACHINE
  // ────────────────────────────────────────────────────────────────────────────
  const [isSiteReady, setIsSiteReady] = useState(false);
  
  // Track individual asset readiness
  const videoLoaded = useRef(false);
  const frontLoaded = useRef(false);
  const backLoaded = useRef(false);

  useEffect(() => {
    // Lock document scrolling while loading
    if (!isSiteReady) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isSiteReady]);

  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();
    const MIN_LOAD_TIME = 5000; // Force at least 5 seconds
    const MAX_LOAD_TIME = 8000; // Force close after 8 seconds (roughly 1 full loader video loop)

    const checkReadyState = setInterval(() => {
      if (!isMounted) return;
      const elapsed = Date.now() - startTime;
      
      const allAssetsReady = videoLoaded.current && frontLoaded.current && backLoaded.current;

      // 1. If 5 seconds have passed AND assets are ready -> OPEN
      // 2. If 8 seconds have passed (max limit reached) -> FORCE OPEN
      if (elapsed >= MIN_LOAD_TIME) {
        if (allAssetsReady || elapsed >= MAX_LOAD_TIME) {
          setIsSiteReady(true);
          clearInterval(checkReadyState);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(checkReadyState);
    };
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // 3D SCROLL & GLIDE ENGINE
  // ────────────────────────────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: scrollTrackRef,
    offset: ["start start", "end end"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [0, -12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 1]);

  const cardWidth = "w-[85vw] sm:w-[460px] md:w-[540px]";
  const thicknessLayers = Array.from({ length: 16 }, (_, i) => i - 8);

  useEffect(() => {
    // Prevent scroll hijacking if the site is still loading
    if (!isSiteReady) return; 

    const track = scrollTrackRef.current;
    if (!track) return;

    let scrollAnimation: ReturnType<typeof animate> | null = null;
    let touchStartY = 0;

    const handleScrollIntention = (deltaY: number, e: Event) => {
      const rect = track.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const stageA = 0; 
      const stageB = -windowHeight;

      const atStageA = rect.top <= 5 && rect.top >= -5;
      const atStageB = rect.top <= stageB + 5 && rect.top >= stageB - 5;
      const isBetween = rect.top < -5 && rect.top > stageB + 5;

      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;

      const shouldHijack =
        isBetween ||
        (atStageA && isScrollingDown) ||
        (atStageB && isScrollingUp);

      if (shouldHijack) {
        e.preventDefault();

        const targetAbsoluteY = isScrollingDown
          ? window.scrollY + rect.top + windowHeight 
          : window.scrollY + rect.top; 

        if (scrollAnimation) scrollAnimation.stop();

        scrollAnimation = animate(window.scrollY, targetAbsoluteY, {
          duration: 1.2, 
          ease: [0.25, 0.1, 0.25, 1], 
          onUpdate: (latest) => window.scrollTo(0, latest),
          onComplete: () => { scrollAnimation = null; }
        });
      }
    };

    const onWheel = (e: WheelEvent) => handleScrollIntention(e.deltaY, e);

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      if (scrollAnimation) scrollAnimation.stop();
    };

    const onTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) > 10) handleScrollIntention(deltaY, e);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (scrollAnimation) scrollAnimation.stop();
    };
  }, [isSiteReady]);

  return (
    <div ref={scrollTrackRef} className="relative h-[200vh] w-full bg-black">
      
      {/* ───────────────────────────────────────────────────────────────────────
          GLOBAL HERO LOADER
          ─────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isSiteReady && <Loader variant="hero" />}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────────
          3D GRAPHICS ANIMATION MOTOR
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 h-full w-full pointer-events-none z-30">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center">
          <motion.div
            style={{ 
              rotateY,
              rotateX,
              scale,
              transformStyle: "preserve-3d",
              perspective: 1600,
              willChange: "transform"
            }}
            className={`relative ${cardWidth} aspect-[1280/794] pointer-events-auto`}
          >
            {/* Edge Panels */}
            <div style={{ transform: `translateX(-50%) rotateY(-90deg)`, width: `16px` }} className="absolute top-0 left-0 h-full bg-[#c5cbcf] border-y border-black/5" />
            <div style={{ transform: `translateX(50%) rotateY(90deg)`, width: `16px` }} className="absolute top-0 right-0 h-full bg-[#bdc3c7] border-y border-black/5" />
            <div style={{ transform: `translateY(-50%) rotateX(90deg)`, height: `16px` }} className="absolute top-0 left-0 w-full bg-[#d2d7da] border-x border-black/5" />
            <div style={{ transform: `translateY(50%) rotateX(-90deg)`, height: `16px` }} className="absolute bottom-0 left-0 w-full bg-[#a2a8ac] border-x border-black/5" />

            {/* Solid Core Stack */}
            {thicknessLayers.map((zOffset) => (
              <div
                key={zOffset}
                style={{ transform: `translateZ(${zOffset}px)`, backfaceVisibility: "hidden" }}
                className="absolute inset-0 w-full h-full bg-[#cbd5e1] rounded-2xl shadow-sm"
              />
            ))}

            {/* FRONT FACE LAYER */}
            <div 
              style={{ backfaceVisibility: "hidden", transform: "translateZ(8.5px)", WebkitBackfaceVisibility: "hidden" }}
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-white"
            >
              {/* Added unoptimized to bypass server-side processing errors */}
              <Image 
                src="/images/hello-static-logo.png" 
                alt="Identity Card Front Badge" 
                fill 
                className="object-cover" 
                priority 
                unoptimized
                onLoad={() => { frontLoaded.current = true; }} 
              />
            </div>

            {/* BACK FACE LAYER */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(8.5px)", WebkitBackfaceVisibility: "hidden" }}
              className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-[#e2e8f0]"
            >
              {/* Added unoptimized to bypass server-side processing errors */}
              <Image 
                src="/images/badge-back-bg.png" 
                alt="Card Backing Graphic Profile" 
                fill 
                className="object-cover z-0" 
                priority 
                unoptimized
                onLoad={() => { backLoaded.current = true; }}
              />
              <div className="absolute top-[28%] bottom-[5%] left-[5%] right-[5%] z-10 flex items-center justify-center px-2 sm:px-4 text-center select-text">
                <p className="text-black text-[11px] sm:text-xs md:text-sm lg:text-[15px] leading-snug sm:leading-relaxed font-bold text-balance tracking-tight">
                  A global social establishment to empower brands, founders, agencies, and production houses. 
                  We are designed to operate like the inner circle of the world&apos;s most relevant people. 
                  We offer plug & play creative and strategic leadership. All while building a thriving 
                  social circle for you, your brand and your clients.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          STAGE 1: HERO VIDEO BACKGROUND
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="relative h-screen w-full overflow-hidden bg-black z-10 flex items-center justify-center">
        <video
          autoPlay muted loop playsInline preload="auto"
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-landscape-bg.mp4`}
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-90"
          onLoadedData={() => { videoLoaded.current = true; }}
        />
        <video
          autoPlay muted loop playsInline preload="auto"
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/videos/website-portrait-static-option.mp4`}
          className="block md:hidden absolute inset-0 w-full h-full object-cover opacity-90"
          onLoadedData={() => { videoLoaded.current = true; }}
        />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          STAGE 2: MANIFESTO CONCRETE LAYER 
          ─────────────────────────────────────────────────────────────────────── */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center z-10 bg-white">
        {/* Added unoptimized */}
        <Image src="/images/bio-bg.jpg" alt="Concrete Plaster Textured Backdrop" fill className="object-cover object-center z-0 opacity-95" quality={100} unoptimized />

        <div className="relative z-10 w-full max-w-7xl mx-auto text-center flex flex-col items-center justify-center gap-20 md:gap-32 h-full py-12 md:py-16">
          <div className={`${cardWidth} aspect-[1280/794] invisible pointer-events-none`} />

          <div className="flex justify-between w-full max-w-[300px] sm:max-w-[480px] md:max-w-[700px] lg:max-w-[850px] text-2xl sm:text-3xl md:text-5xl font-black tracking-widest select-none">
            <span className="text-black drop-shadow-sm">टेस्ट</span>
            <span className="text-black drop-shadow-sm">ٹیسٹ</span>
            <span className="text-black drop-shadow-sm">ടേസ്റ്റ്</span>
          </div>
        </div>
      </div>
    </div>
  );
}