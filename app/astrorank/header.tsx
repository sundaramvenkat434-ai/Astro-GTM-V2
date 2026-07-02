"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",     href: "#features"     },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing",      href: "#pricing"      },
];

function scrollTo(href: string) {
  if (!href.startsWith("#")) { window.location.href = href; return; }
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function AstroLogo({ className = "" }: { className?: string }) {
  return (
    <a href="/astrorank" className={`flex items-center gap-2.5 shrink-0 group ${className}`}>
      {/* Icon mark */}
      <div className="relative w-10 h-10 shrink-0">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#1D4ED8"/>
          <rect width="32" height="32" rx="8" fill="url(#logo_grad)" opacity="0.6"/>
          <path d="M16 5L19.5 11.5H26L20.5 15.8L23 23L16 19L9 23L11.5 15.8L6 11.5H12.5L16 5Z" fill="white"/>
          <circle cx="16" cy="15" r="3.5" fill="#BFDBFE" fillOpacity="0.8"/>
          <defs>
            <linearGradient id="logo_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6"/>
              <stop offset="1" stopColor="#1D4ED8"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Wordmark */}
      <span className="text-[21px] font-black tracking-[-0.045em] text-slate-900 leading-none">
        Astro<span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Rank</span>
      </span>
    </a>
  );
}

export default function AstroRankHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/96 backdrop-blur-md border-b border-slate-200/70 shadow-[0_1px_16px_rgba(15,23,42,0.07)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 h-[64px] flex items-center justify-between gap-6">

          <AstroLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3.5 shrink-0">
            <button
              onClick={() => scrollTo("#pricing")}
              className="text-[13.5px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150"
            >
              Sign in
            </button>
            <motion.button
              onClick={() => scrollTo("#pricing")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-[13.5px] font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-150 shadow-md shadow-blue-600/20 ring-1 ring-blue-700/20"
            >
              Get 10 Pages FREE
              <ArrowRight size={13} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="absolute top-0 right-0 bottom-0 w-[75vw] max-w-[300px] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-[64px] border-b border-slate-100">
                <AstroLogo />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <nav className="flex flex-col px-3 pt-3 pb-5 gap-0.5 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.06 }}
                    onClick={() => { scrollTo(link.href); setMenuOpen(false); }}
                    className="px-3 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-left"
                  >
                    {link.label}
                  </motion.button>
                ))}
              </nav>

              <div className="px-4 pb-8 flex flex-col gap-2.5">
                <button
                  onClick={() => { scrollTo("#pricing"); setMenuOpen(false); }}
                  className="w-full py-2.5 text-center text-[13.5px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
                >
                  Get 10 Pages FREE
                </button>
                <button
                  onClick={() => { scrollTo("#pricing"); setMenuOpen(false); }}
                  className="w-full py-2 text-center text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
