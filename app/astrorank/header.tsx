"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",    href: "#features"  },
  { label: "How It Works",href: "#how-it-works" },
  { label: "Pricing",     href: "#pricing"   },
  { label: "Blog",        href: "/articles"  },
];

export default function AstroRankHeader() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 16); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_16px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <a href="/astrorank" className="flex items-center gap-2.5 group">
            <span
              className={`text-[15px] font-black tracking-[-0.04em] transition-colors duration-200 ${
                scrolled ? "text-slate-900" : "text-slate-900"
              }`}
            >
              ASTRO
            </span>
            <span
              className="text-[15px] font-black tracking-[-0.04em] bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"
            >
              RANK
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium transition-colors duration-150 ${
                  scrolled
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#pricing"
              className={`text-[13.5px] font-medium transition-colors duration-150 ${
                scrolled ? "text-slate-600 hover:text-slate-900" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign in
            </a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[13px] font-semibold rounded-xl shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-300 hover:from-blue-500 hover:to-blue-400 transition-all duration-200"
            >
              Join Early Access
              <ArrowRight size={13} />
            </motion.a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute top-0 right-0 bottom-0 w-[80vw] max-w-[320px] bg-white shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 h-[60px] border-b border-slate-100">
                <span className="text-[15px] font-black tracking-[-0.04em]">
                  ASTRO<span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">RANK</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col px-4 pt-4 pb-6 gap-1 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-3 rounded-xl text-[15px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              {/* Mobile CTAs */}
              <div className="px-4 pb-8 flex flex-col gap-2.5">
                <a
                  href="#"
                  className="w-full py-3 text-center text-[14px] font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </a>
                <a
                  href="#"
                  className="w-full py-3 text-center text-[14px] font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-sm shadow-blue-200"
                >
                  Join Early Access
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
