"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#54EB17] text-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-12">
          
          {/* LEFT CORNER: Brand Identity */}
          <div className="flex flex-col">
            <div className="relative w-72 md:w-96 lg:w-[450px] h-32 md:h-48 mb-10">
              <Image 
                src="/images/taest-logo-outline.png" 
                alt="taest. logo"
                fill
                className="object-contain object-left"
              />
            </div>
            <div className="flex flex-col gap-6">
              {/* Changed leading-relaxed to leading-snug to tighten line spacing */}
              <p className="text-xl md:text-2xl font-medium max-w-lg leading-snug opacity-85">
                Your inner circle of global tastemakers who upgrade your Cltrl OS. Make work play. Build your brand a thriving space. Help you earn <b>tomorrow&apos;s currency today.</b>
              </p>
            </div>
          </div>

          {/* RIGHT CORNER: The Form & Contact Info */}
          <div className="flex flex-col">
            <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10">
              Meet over coffee?
            </h3>
            
            <form className="flex flex-col gap-8 mb-16" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Intro</label>
                <input 
                  type="text" 
                  placeholder="Great work starts with great intros." 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-3 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Email ID / Mobile</label>
                <input 
                  type="text" 
                  placeholder="Help us find you where you're the most accessible and available." 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-3 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-widest">Brief</label>
                <input 
                  type="text" 
                  placeholder="How can we be of service?" 
                  className="bg-transparent border-b border-black/30 placeholder-black/50 py-3 text-lg focus:outline-none focus:border-black transition-colors w-full font-medium"
                />
              </div>

              <button 
                type="submit" 
                className="bg-[#1A1A1A] text-white px-8 py-5 font-bold uppercase tracking-widest hover:bg-black transition-colors w-fit mt-4 flex items-center gap-3 rounded-sm"
              >
                Let&apos;s Talk 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
                </svg>
              </button>
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
                  <a href="https://linkedin.com/company/taest" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
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