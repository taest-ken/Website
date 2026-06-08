"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import MediaModal, { Media } from "./MediaModal";

// --- TYPES ---

export interface FolderConfig {
  path: string;
  sort: "ordered" | "random";
}

interface CollabData {
  headline: string;
  subhead: string;
  description: string;
  folders: FolderConfig[];
  featuredMedia?: string;
}

// --- DATA ---
const collabsData: CollabData[] = [
  {
    headline: "Birla Estates x Gujarat Titans with Trailer Park Group",
    subhead: "IPL Sponsorship Campaign",
    featuredMedia: "film/thumbnail.mp4",
    description: "A brand building campaign for a legacy real estate player that came hot on the heels of the IPL 2026 go live date. The task wasn't just to put Birla Estates on the map as the principal sponsor of Gujarat Titans. It was to repackage the brand's ''life designed'' philosophy from a sporting lens. The result? A campaign that was built with all heart, played with all heart and loved with all heart.",
    folders: [
      { path: "collabs_media/birla-gt/film", sort: "ordered" },
      { path: "collabs_media/birla-gt/stat", sort: "ordered" },
      { path: "collabs_media/birla-gt/camp", sort: "ordered" }
    ],
  },
  {
    headline: "Google AI Mode with Trailer Park Group",
    subhead: "AICD OOH Campaign",
    featuredMedia: "google-ai/1/thumbnail-motion.mp4",
    description: "An outdoor first campaign to familiarise Bharat with Google's new AI mode by placing the product at the heart of the country's dreams and desires.",
    folders: [
      { path: "collabs_media/google-ai/1", sort: "ordered" },
      { path: "collabs_media/google-ai/2/creatives", sort: "ordered" },
      { path: "collabs_media/google-ai/2/strategy", sort: "ordered" },
      { path: "collabs_media/google-ai/3/creatives", sort: "ordered" },
      { path: "collabs_media/google-ai/3/strategy", sort: "ordered" }
    ],
  },
  {
    headline: "Taest Brand Book Inhouse",
    subhead: "Brand world building + Identity",
    featuredMedia: "1.mp4",
    description: "A demonstration of the agency's brand-world designing capabilities, displayed through a detailed immersion into our own branding & identity process.",
    folders: [{ path: "collabs_media/brand-book", sort: "ordered" }],
  },
  {
    headline: "Taest HumAIne Kitchen Inhouse",
    subhead: "AI Creative Direction",
    featuredMedia: "thumbnail.png",
    description: "A demonstration of the agency's AI creative direction capabilities displayed via our stunning social posts.",
    folders: [{ path: "collabs_media/creative-direction", sort: "ordered" }],
  },
  {
    headline: "Taest Motion Ident Inhouse",
    subhead: "Motion animation",
    featuredMedia: "2.mp4",
    description: "A demonstration of the agency's motion graphics and animation capabilities displayed via taest's motion ident, designed in-house.",
    folders: [{ path: "collabs_media/motion-ident", sort: "ordered" }],
  },
  {
    headline: "Vicks Inhaler with Sparkt",
    subhead: "Creative Direction, Scriptwriting, Animatics, Jingle & STBs",
    featuredMedia: "animatics/thumbnail.png",
    description: "A demonstration of the agency's plug and play leadership capability, displayed via co-creation of the campaign that set out to reimagine Vicks inhaler for a wider demographic.",
    folders: [
      { path: "collabs_media/vicks/animatics", sort: "ordered" },
      { path: "collabs_media/vicks/sketches", sort: "ordered" },
    ],
  },
  {
    headline: "Woodland Winter '25 Lookbook",
    subhead: "AI Creative Direction",
    featuredMedia: "thumbnail.png",
    description: "Our AI creative direction and filmmaking capabilities displayed via work developed during the pre-production stage for Woodland.",
    folders: [{ path: "collabs_media/woodland", sort: "ordered" }],
  },
];

// --- COMPONENT: AUTO-CAROUSEL CARD ---
function WorkCard({ collab, onClick }: { collab: CollabData; index: number; onClick: (media: Media[]) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    const queryParams = new URLSearchParams({
      config: JSON.stringify(collab.folders)
    }).toString();

    fetch(`/api/media?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        if (data.media && data.media.length > 0) {
          setMedia(data.media);
          // Set the correct starting frame right when the data loads!
          const featuredTarget = collab.featuredMedia;
          const foundIndex = featuredTarget ? data.media.findIndex((m: Media) => m.src.includes(featuredTarget)) : -1;
          setActiveIdx(foundIndex !== -1 ? foundIndex : 0);
        }
      })
      .catch(err => console.error("Failed to load media", err));
  }, [collab.folders, collab.featuredMedia]);

  const activeMedia = media[activeIdx];

  return (
    <article 
      onClick={() => onClick(media)}
      className="group relative w-full h-[400px] md:h-[500px] lg:h-[600px] border border-dark-grey rounded-lg overflow-hidden bg-secondary/30 flex flex-col shadow-lg cursor-pointer"
    >
      <div className="relative flex-1 min-h-0 bg-black border-b border-dark-grey overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
            ) : (
              <Image src={activeMedia?.src} alt={collab.headline} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Shortened black bar containing only the subhead */}
      <div className="h-[60px] px-6 bg-black flex items-center">
        <span className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-neon-green transition-colors">
          {collab.subhead}
        </span>
      </div>
    </article>
  );
}


// --- MAIN EXPORT ---
export default function Collabs() {
  const [selectedCollab, setSelectedCollab] = useState<{ collab: CollabData; media: Media[] } | null>(null);

  return (
    <section id="collabs" className="px-6 lg:px-8 py-20 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Module Header & Pitch */}
        <div className="mb-20">
          <span className="text-xs uppercase tracking-widest text-neon-green font-medium">
            Portfolio
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-12">
            Collabs
          </h2>

          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">
            {/* The Pitch Text */}
            {/* Added max-w-2xl and stepped down font sizes to text-lg md:text-xl */}
            <div className="w-full md:w-2/3 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              <p className="mb-6">
                Get access to <span className="text-white font-medium">plug & play creative, brand and strategic leadership</span> to bolster your in-house team. 
              </p>
              <p className="mb-6">
                Cultural intelligence catch-ups, taste-maxing sessions for your team, invites to social mixers, creative tech capabilities/prototyping and access to a community of top industry talent.
              </p>
              <p className="text-neon-green font-medium">
                Want to know more? Let&apos;s set up a call to explore synergies.
              </p>
            </div>

            {/* The Hotline Animation - Clickable to Contact */}
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-end justify-center">
              <a 
                href="#contact" 
                className="group relative block w-64 h-64 md:w-72 md:h-72 lg:w-[320px] lg:h-[320px] rounded-full flex items-center justify-center overflow-hidden border border-dark-grey/40 transition-colors cursor-pointer"
              >
                <video 
                  src="/assets/hotline-spin.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover scale-125 group-hover:scale-110 transition-transform duration-500" 
                />
              </a>
            </div>
          </div>
        </div>

        {/* Zig-Zag Project Grid */}
        <div className="flex flex-col gap-24 md:gap-32 lg:gap-40">
          {collabsData.map((collab, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={collab.headline} className={`flex flex-col md:flex-row items-stretch gap-8 lg:gap-16 ${!isEven ? "md:flex-row-reverse" : ""}`}>
                <div className="w-full md:w-1/2">
                  <WorkCard collab={collab} index={index} onClick={(fetchedMedia) => setSelectedCollab({ collab, media: fetchedMedia })} />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center py-4">
                  {/* Reduced max-w-xl to max-w-md lg:max-w-lg to increase margin space */}
                  <div className={`max-w-md lg:max-w-lg ${!isEven ? "md:ml-auto md:text-right" : ""}`}>
                    {/* The new Headline replacing "The Vision" */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-6">{collab.headline}</h3>
                    {/* Stepped down font sizes to text-base md:text-lg */}
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{collab.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedCollab && <MediaModal media={selectedCollab.media} onClose={() => setSelectedCollab(null)} />}
      </AnimatePresence>
    </section>
  );
}