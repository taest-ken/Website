"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for the custom events dispatched by the MediaModal
  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    window.addEventListener("modalOpen", handleModalOpen);
    window.addEventListener("modalClose", handleModalClose);

    return () => {
      window.removeEventListener("modalOpen", handleModalOpen);
      window.removeEventListener("modalClose", handleModalClose);
    };
  }, []);

  const navLinks = [
    { name: "Collabs", href: "#collabs" },
    { name: "Club", href: "#club" },
    { name: "Clients", href: "#clients" },
    { name: "Crew", href: "#crew" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header 
      initial={{ y: 0 }}
      animate={{ y: isModalOpen ? "-100%" : "0%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-dark-grey"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Container with Hover Reveal */}
          <Link 
            href="/" 
            onClick={closeMenu}
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
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-white text-sm font-medium hover:text-neon-green transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            // Added hover:text-neon-green and transition-colors
            className="md:hidden text-white hover:text-neon-green transition-colors p-2 ml-auto z-[60] relative"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              // X Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-dark-grey md:hidden"
          >
            <nav className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-white text-xl font-medium hover:text-neon-green transition-colors w-full border-b border-white/10 pb-4 last:border-0"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}