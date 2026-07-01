"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Features",      href: "#features"    },
  { label: "How It Works",  href: "#how-it-works" },
  { label: "Pricing",       href: "#pricing"     },
  { label: "Blog",          href: "/articles"    },
];

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
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-[0_1px_12px_rgba(15,23,42,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-[60px] flex items-center justify-between gap-8">

          {/* Logo */}
          <a href="/astrorank" className="flex items-center shrink-0">
            <span className="text-[15px] font-black tracking-[-0.045em] text-slate-900">ASTRO</span>
            <span className="text-[15px] font-black tracking-[-0.045em] bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">RANK</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 rounded-lg text-[13.5px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <a
              href="#"
              className="text-[13.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
            >
              Sign in
            </a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="inline-flex items-center gap-1.5 px-4 py-[7px] bg-blue-600 text-white text-[13px] font-semibold rounded-lg hover:bg-blue-500 transition-colors duration-150"
            >
              Join Early Access
              <ArrowRight size={12} strokeWidth={2.5} />
            </motion.a>
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
              <div className="flex items-center justify-between px-5 h-[60px] border-b border-slate-100">
                <span className="text-[15px] font-black tracking-[-0.045em]">
                  ASTRO<span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">RANK</span>
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <nav className="flex flex-col px-3 pt-3 pb-5 gap-0.5 flex-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.06 }}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-[14.5px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="px-4 pb-8 flex flex-col gap-2.5">
                <a
                  href="#"
                  className="w-full py-2.5 text-center text-[13.5px] font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Sign in
                </a>
                <a
                  href="#"
                  className="w-full py-2.5 text-center text-[13.5px] font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-colors"
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
