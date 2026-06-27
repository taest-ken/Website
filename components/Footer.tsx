"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getCalApi } from "@calcom/embed-react";

// Reusable Nail Component Generator with 50px scale and tighter edge proximity
const IndustrialNails = () => (
  <>
    <div className="absolute top-2 left-2 w-[50px] h-[50px] opacity-85 z-20 drop-shadow-[2px_3px_2px_rgba(0,0,0,0.4)]">
      <Image src="/images/nail.png" alt="Industrial Nail" fill className="object-contain -rotate-12" />
    </div>
    <div className="absolute top-2 right-2 w-[50px] h-[50px] opacity-85 z-20 drop-shadow-[2px_3px_2px_rgba(0,0,0,0.4)]">
      <Image src="/images/nail.png" alt="Industrial Nail" fill className="object-contain rotate-[65deg]" />
    </div>
    <div className="absolute bottom-2 left-2 w-[50px] h-[50px] opacity-85 z-20 drop-shadow-[2px_3px_2px_rgba(0,0,0,0.4)]">
      <Image src="/images/nail.png" alt="Industrial Nail" fill className="object-contain rotate-[110deg]" />
    </div>
    <div className="absolute bottom-2 right-2 w-[50px] h-[50px] opacity-85 z-20 drop-shadow-[2px_3px_2px_rgba(0,0,0,0.4)]">
      <Image src="/images/nail.png" alt="Industrial Nail" fill className="object-contain -rotate-[25deg]" />
    </div>
  </>
);

export default function Footer() {
  const [intro, setIntro] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Pre-load the Cal.com engine in the background for zero latency
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { 
        theme: "dark", 
        styles: { branding: { brandColor: "#54EB17" } }, 
        hideEventTypeDetails: false,
        layout: "month_view" 
      });
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!intro.trim()) {
      setStatusMessage({ type: "error", text: "Please provide an introduction." });
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setStatusMessage({ type: "error", text: "Please provide either an Email ID or a Contact No." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ type: "success", text: "Opening calendar..." });

    try {
      const cal = await getCalApi();
      
      // 1. Set up a listener for a successful booking
      cal("on", {
        action: "bookingSuccessful",
        callback: () => {
          // Clear the form and show success message when they finish booking
          setIntro(""); 
          setEmail(""); 
          setPhone("");
          setStatusMessage({ type: "success", text: "Booking confirmed! Check your inbox." });
        }
      });

      // 2. Trigger the modal
      cal("modal", {
        calLink: "taest/discovery", // Ensure this matches your actual Cal.com event slug
        config: {
          email: email.trim(),
          notes: intro.trim(),
          "metadata[phone]": phone.trim(), 
        }
      });
      
    } catch (err) {
      setStatusMessage({ type: "error", text: "Failed to open calendar. Please try again later." });
    } finally {
      // 3. Reset the button state shortly after the modal takes over the screen
      // so it isn't stuck on "Loading..." when they close it.
      setTimeout(() => {
        setIsSubmitting(false);
        // Only clear the status message if it currently says "Opening calendar..."
        setStatusMessage((prev) => prev?.text === "Opening calendar..." ? null : prev);
      }, 2000);
    }
  };

  return (
    <footer 
      id="contact" 
      className="text-black bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bio-bg.jpg')" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-start">
          
          {/* LEFT CORNER: Brand Identity */}
          <div className="flex flex-col w-fit max-w-md md:max-w-lg">
            <div className="relative w-72 md:w-96 lg:w-[450px] h-32 md:h-48 mb-6">
              <Image 
                src="/images/taest-logo-outline.png" 
                alt="taest. logo"
                fill
                className="object-contain object-left"
              />
            </div>

            <div className="relative bg-neutral-900/[0.05] backdrop-blur-[2px] border border-t-white/20 border-r-white/20 border-b-black/30 border-l-black/30 p-10 md:p-14 rounded-2xl shadow-[-12px_12px_24px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.15)] w-fit">
              <IndustrialNails />
              <p className="relative z-10 text-xl md:text-2xl font-medium leading-snug opacity-85 mt-4">
                Your inner circle of global tastemakers who upgrade your Cltrl OS. Make work play. Build your brand a thriving space. Help you earn <b>tomorrow&apos;s currency today.</b>
              </p>
            </div>
          </div>

          {/* RIGHT CORNER: The Form & Contact Info */}
          <div className="flex flex-col w-full max-w-xl">
            <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10">
              Meet over coffee?
            </h3>
            
            <form 
              className="relative bg-neutral-900/[0.08] backdrop-blur-[2px] border border-t-white/20 border-r-white/20 border-b-black/30 border-l-black/30 p-10 md:p-14 rounded-2xl shadow-[-12px_12px_24px_rgba(0,0,0,0.08),inset_1px_1px_2px_rgba(255,255,255,0.15)] flex flex-col gap-6 mb-16 w-full sm:w-[480px] md:w-[520px]" 
              onSubmit={handleSubmit}
            >
              <IndustrialNails />
              
              <div className="relative z-10 flex flex-col gap-2 mt-4">
                <label className="text-sm font-black uppercase tracking-widest">Intro *</label>
                <input 
                  type="text" 
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="Great work starts with great intros." 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-2 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Email ID</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Where can we reach your inbox?" 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-2 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Contact No.</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Best number for a quick call or WhatsApp message." 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-2 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative z-10 flex items-center gap-6 mt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#1A1A1A] text-[#54EB17] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] transform hover:scale-105 transition-all duration-300 ease-out w-fit flex items-center gap-3 rounded-lg shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "LOADING..." : "BOOK A SESSION"}
                  {!isSubmitting && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
                    </svg>
                  )}
                </button>

                {statusMessage && (
                  <p className={`text-sm font-bold uppercase tracking-wider ${
                    statusMessage.type === "success" ? "text-neutral-800" : "text-red-600"
                  }`}>
                    {statusMessage.text}
                  </p>
                )}
              </div>
            </form>

            <div className="pt-8 border-t border-black/20 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <span className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2">Email</span>
                <a href="mailto:hello@taest.in" className="text-xl font-bold hover:opacity-60 transition-opacity break-all">
                  hello@taest.in
                </a>
              </div>
              <div>
                <span className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2">Phone</span>
                <a href="tel:+919999429456" className="text-xl font-bold hover:opacity-60 transition-opacity block mb-6">
                  +91 9999429456
                </a>
                <span className="block text-xs font-black uppercase tracking-widest opacity-60 mb-2">Socials</span>
                <div className="flex gap-6 font-bold">
                  <a href="https://instagram.com/taest.club" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="https://linkedin.com/company/taest-inc" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs uppercase font-black tracking-widest">© {new Date().getFullYear()} taest.</p>
          <p className="text-xs uppercase font-black tracking-widest">In taest we trust.</p>
        </div>
      </div>
    </footer>
  );
}