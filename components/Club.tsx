"use client";

import { useState, useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import MediaModal, { Media } from "./MediaModal";

// --- TYPES ---

export interface FolderConfig {
  path: string;
  sort: "ordered" | "random";
}

interface ClubData {
  id: string;
  title: string;
  tagline: string;
  size: string;
  folders: FolderConfig[];
}

// --- DATA ---
const clubItems: ClubData[] = [
  {
    id: "os-reports",
    title: "2025 CLTRL OS reports",
    tagline: "Upgrade your cultural software.",
    size: "md:col-span-2 md:row-span-2",
    folders: [
      { path: "club_media/os-reports/part 1", sort: "ordered" },
      { path: "club_media/os-reports/part 2", sort: "ordered" },
      { path: "club_media/os-reports/part 3", sort: "ordered" }
    ],
  },
  {
    id: "feed",
    title: "The Feed",
    tagline: "Social highlights",
    size: "md:col-span-1 md:row-span-2",
    folders: [
      { path: "club_media/feed/1", sort: "ordered" },
      { path: "club_media/feed/2", sort: "random" } // Example of mixing!
    ],
  },
  {
    id: "mixers",
    title: "taest mixers",
    tagline: "Meet, network, ideate with new tastemakers.",
    size: "md:col-span-1 md:row-span-1",
    folders: [{ path: "club_media/mixers", sort: "ordered" }],
  },
  {
    id: "muscle-up",
    title: "Muscle up",
    tagline: "Flex your creative muscles.",
    size: "md:col-span-1 md:row-span-1",
    folders: [{ path: "club_media/muscle-up", sort: "random" }], // Update this path to match your S3 structure
  },
  {
    id: "trust",
    title: "In taest we trust",
    tagline: "Develop, expand, evolve your taste.",
    size: "md:col-span-1 md:row-span-1", // Shrunk to 1x1
    folders: [
      { path: "club_media/in-taest-we-trust/1", sort: "random" },
      { path: "club_media/in-taest-we-trust/2", sort: "random" }
    ],
  },
  {
    id: "bloopers",
    title: "Bloopers",
    tagline: "Unfiltered access.",
    size: "md:col-span-1 md:row-span-1", // Moved beside Trust
    folders: [
      { path: "club_media/bloopers/vid", sort: "ordered" },
      { path: "club_media/bloopers/ai slop", sort: "random" }
    ],
  },
  {
    id: "capabilities",
    title: "What we do",
    tagline: "Capabilities & Offerings.",
    size: "md:col-span-2 md:row-span-1",
    folders: [{ path: "club_media/what-we-do", sort: "random" }],
  },
];

// --- COMPONENT: BENTO BOX CARD ---
function BentoCard({ item, onClick }: { item: ClubData; onClick: (media: Media[]) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    const queryParams = new URLSearchParams({
      config: JSON.stringify(item.folders)
    }).toString();

    fetch(`/api/media?${queryParams}`)
      .then(res => res.json())
      .then(data => {
        if (data.media && data.media.length > 0) {
          setMedia(data.media);
        }
      })
      .catch(err => console.error("Failed to load media", err));
  }, [item.folders]);

  // Organic, staggered timers (3s to 5s random flip delay)
  useEffect(() => {
    if (media.length <= 1) return;
    let timeoutId: NodeJS.Timeout;

    const loop = () => {
      const delay = Math.random() * 2000 + 3000;
      timeoutId = setTimeout(() => {
        setActiveIdx((prev) => (prev + 1) % media.length);
        loop();
      }, delay);
    };

    loop();
    return () => clearTimeout(timeoutId);
  }, [media.length]);

  const activeMedia = media[activeIdx];

  return (
    <div 
      onClick={() => onClick(media)}
      className={`${item.size} group relative w-full h-full min-h-[300px] border border-dark-grey rounded-xl overflow-hidden bg-secondary/10 cursor-pointer shadow-lg`}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }} // Snappier crossfade
            className="absolute inset-0"
          >
            {activeMedia?.type === "video" ? (
              <video src={activeMedia.src} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            ) : activeMedia?.type === "image" ? (
              <Image src={activeMedia.src} alt={item.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-black/80 group-hover:from-black/60 transition-all duration-500 pointer-events-none" />

      <div className="absolute top-6 left-6 max-w-[75%]">
        <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-neon-green transition-colors duration-300">
          {item.title}
        </h3>
      </div>

      <div className="absolute bottom-6 right-6 max-w-[75%] text-right">
        <p className="text-sm md:text-base font-medium text-white/80 group-hover:text-white transition-colors duration-300">
          {item.tagline}
        </p>
      </div>
    </div>
  );
}


// --- MAIN EXPORT ---
export default function Club() {
  const [selectedItem, setSelectedItem] = useState<{ item: ClubData; media: Media[] } | null>(null);

  return (
    <section id="club" className="px-6 lg:px-8 py-24 bg-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Module Header & Pitch */}
        <div className="mb-20">
          <span className="text-xs uppercase tracking-widest text-neon-green font-medium">
            Culture Lab
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8">
            Club
          </h2>
          
          {/* Reduced max-w-3xl to max-w-2xl */}
          <div className="max-w-2xl">
            <p className="text-xl md:text-2xl font-bold text-white mb-4">
              The social club era of brand building is here.
            </p>
            {/* Stepped down font sizes to text-lg md:text-xl */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              An era where brands climb the top of the social ladder of influence, relevance and superstardom, all on the back of their exquisite, unmatched taste.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[300px] gap-4 md:gap-6">
          {clubItems.map((item) => (
            <BentoCard key={item.id} item={item} onClick={(fetchedMedia) => setSelectedItem({ item, media: fetchedMedia })} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && <MediaModal media={selectedItem.media} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
    </section>
  );
}