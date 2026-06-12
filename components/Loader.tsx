"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  variant?: "hero" | "modal";
}

export default function Loader({ variant = "hero" }: LoaderProps) {
  const isHero = variant === "hero";

  return (
    <motion.div
      key="global-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`z-[999] flex items-center justify-center bg-black/95 backdrop-blur-2xl ${
        isHero ? "fixed inset-0" : "absolute inset-0 rounded-xl"
      }`}
    >
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-full shadow-[0_0_40px_rgba(84,235,23,0.15)] ${
          isHero ? "w-48 h-48 md:w-64 md:h-64" : "w-24 h-24 md:w-32 md:h-32"
        }`}
      >
        <video
          src={`${process.env.NEXT_PUBLIC_S3_BASE_URL}/collabs_media/motion-ident/2.mp4`}
          autoPlay
          muted
          loop
          playsInline
          // Scaled slightly up to avoid any harsh video borders inside the circle
          className="w-full h-full object-cover scale-[1.15]"
        />
      </div>
    </motion.div>
  );
}