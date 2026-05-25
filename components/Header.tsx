"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-dark-grey">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Container with Hover Reveal */}
          <Link 
            href="/" 
            className="group relative flex items-center h-full min-w-[120px]"
            aria-label="taest. home"
          >
            {/* The SVG Logo (Fades out on hover) */}
            <div className="absolute left-0 transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0">
              <Image
                src="/images/taest-logo.png"
                alt="taest."
                width={120}
                height={40}
                priority
              />
            </div>
            
            {/* The Reveal Text (Fades in on hover) - Hidden on mobile to prevent overflow */}
            <div className="absolute left-0 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 hidden md:block whitespace-nowrap">
              <span className="text-white text-sm font-medium tracking-wide">
                Global Social Club For Future Brand Builders
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="#collabs" 
              className="text-white text-sm font-medium hover:text-neon-green transition-colors"
            >
              Collabs
            </Link>
            <Link 
              href="#club" 
              className="text-white text-sm font-medium hover:text-neon-green transition-colors"
            >
              Club
            </Link>
            <Link 
              href="#clients" 
              className="text-white text-sm font-medium hover:text-neon-green transition-colors"
            >
              Clients
            </Link>
            <Link 
              href="#crew" 
              className="text-white text-sm font-medium hover:text-neon-green transition-colors"
            >
              Crew
            </Link>
            <Link 
              href="#contact" 
              className="text-white text-sm font-medium hover:text-neon-green transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2 ml-auto"
            aria-label="Open menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}