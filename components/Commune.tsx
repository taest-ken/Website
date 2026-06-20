"use client";

import Image from "next/image";
import { useState } from "react";

interface BioModuleProps {
  name: string;
  role: string;
  initials: string;
  image?: string; // Add optional image property
  bio: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
  };
}

function BioModule({ name, role, initials, image, bio, socials }: BioModuleProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group p-6 border border-dark-grey rounded-lg bg-secondary/20 hover:border-neon-green/50 transition-colors duration-300 flex flex-col h-full">
      <div className="flex items-start gap-4">
        {/* Avatar Rendering */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-neon-green/20 to-secondary flex items-center justify-center shrink-0 border border-dark-grey group-hover:border-neon-green/50 transition-colors overflow-hidden">
          {image && !imgError ? (
            <Image 
              src={image} 
              alt={`${name} profile picture`} 
              fill 
              className="object-cover"
              onError={() => setImgError(true)} // Instantly flips back to initials if the image file isn't found
            />
          ) : (
            <span className="text-lg font-bold text-white relative z-10">{initials}</span>
          )}
        </div>
        
        {/* Bio content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors truncate">
            {name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{role}</p>
          
          {/* Social Icons (Positioned below the role) */}
          <div className="flex items-center gap-3 mt-3">
            {socials?.instagram && (
              <a 
                href={socials.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-neon-green transition-colors"
                aria-label={`${name}'s Instagram`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            )}
            {socials?.linkedin && (
              <a 
                href={socials.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-neon-green transition-colors"
                aria-label={`${name}'s LinkedIn`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Bio description */}
      <p className="mt-5 text-sm text-muted-foreground leading-relaxed flex-1">
        {bio}
      </p>
    </article>
  );
}

// The exact team data from the founder's notes
const team = [
  {
    name: "Ashish Adpur",
    role: "Founder & CCO",
    initials: "AA",
    image: "/crew/ashish.jpeg", // Add exact filename from public/crew
    bio: "Agency creative head with 12+ years of brand building experience across India's hottest agencies and most sought after brands.",
    socials: {
      instagram: "https://www.instagram.com/sheeshxkebab?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      linkedin: "https://www.linkedin.com/in/ashish-adpur-0218b8195/",
    }
  },
  {
    name: "Sakshi Batra",
    role: "Cofounder & CGO",
    initials: "SB",
    image: "/crew/sakshi.jpeg", // Add exact filename from public/crew
    bio: "Ex brand manager at an Indian blue chip conglomerate, with 10+ years of new age brand building experience.",
    socials: {
      instagram: "https://www.instagram.com/sakshouka?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      linkedin: "https://www.linkedin.com/in/sakshi-batra-619361aa/",
    }
  },
  {
    name: "Ken Jose",
    role: "Creative Technologist",
    initials: "KJ",
    image: "/crew/ken.jpeg", // Add exact filename from public/crew
    bio: "Creative at heart, technologist by degree, solving marketing challenges by creatively using the best of tech.",
    socials: {
      instagram: "https://www.instagram.com/im_kenough11?igsh=MWZ4bmJjdmg3eGNyMA==",
      linkedin: "https://www.linkedin.com/in/ken-jose-46bb71218/",
    }
  },
  {
    name: "Cherry Hazare",
    role: "Design Associate",
    initials: "CH",
    image: "/crew/cherry.jpeg", // Add exact filename from public/crew
    bio: "Our in house designer, social media associate for all things visual.",
    socials: {
      instagram: "https://www.instagram.com/cherryhazare?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      linkedin: "https://www.linkedin.com/in/cherry-hazare-62a6b0319/",
    }
  },
];

export default function Commune() {
  return (
    <section id="crew" className="snap-start px-6 lg:px-8 py-32 bg-black border-t border-dark-grey">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-widest text-neon-green font-medium">
            Team
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            The Crew
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Meet the brains behind{" "}
            <span className="text-white font-medium">taest.</span> — a collective of creative strategists, designers, and cultural architects.
          </p>
        </div>

        {/* Bio modules grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {team.map((member) => (
            <BioModule
              key={member.name}
              name={member.name}
              role={member.role}
              initials={member.initials}
              image={member.image} // Pass the image prop!
              bio={member.bio}
              socials={member.socials}
            />
          ))}
        </div>
      </div>
    </section>
  );
}