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
    <a href="/astrorank" className={`flex items-center gap-2 shrink-0 group ${className}`}>
      {/* Icon mark */}
      <div className="relative w-7 h-7 shrink-0">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="7" fill="#2563EB"/>
          <path d="M14 4L17.5 10.5H24L18.5 14.5L21 21L14 17L7 21L9.5 14.5L4 10.5H10.5L14 4Z" fill="white" fillOpacity="0.95"/>
          <circle cx="14" cy="14" r="3" fill="#93C5FD" fillOpacity="0.7"/>
        </svg>
      </div>
      {/* Wordmark */}
      <span className="text-[15.5px] font-black tracking-[-0.04em] text-slate-900 leading-none">
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
        <div className="max-w-[1280px] mx-auto px-5 lg:px-10 h-[58px] flex items-center justify-between gap-6">

          <AstroLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollTo("#pricing")}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150"
            >
              Sign in
            </button>
            <motion.button
              onClick={() => scrollTo("#pricing")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-500 transition-colors duration-150 shadow-sm shadow-blue-200/70"
            >
              Get 10 Pages FREE
              <ArrowRight size={12} strokeWidth={2.5} />
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
              className="absolute top-0 right-0 bottom-0 w-[75vw] max-w-[280px] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-[58px] border-b border-slate-100">
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
