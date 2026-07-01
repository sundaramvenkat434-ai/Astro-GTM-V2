"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const NAV = [
  {
    title: "Product",
    links: [
      { label: "Features",     href: "#features"     },
      { label: "Pricing",      href: "#pricing"      },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",   href: "/about"    },
      { label: "Blog",    href: "/articles" },
      { label: "Contact", href: "/contact"  },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy",   href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms"          },
    ],
  },
];

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map(l => (
          <li key={l.label}>
            <a
              href={l.href}
              className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors duration-150"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AstroRankFooter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer ref={ref} className="relative bg-white border-t border-slate-100"
      style={{ isolation: "isolate" }}>

      {/* ── CTA band ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.1] mb-3">
            Ready to outrank your competitors?
          </h2>
          <p className="text-[15.5px] text-slate-500 mb-8 leading-relaxed">
            Start with 10 free pages and watch your organic traffic grow.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.a
              href="#"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[14px] font-semibold hover:bg-blue-500 transition-colors duration-150 shadow-sm shadow-blue-100"
            >
              Get 10 Pages FREE
            </motion.a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
            >
              Book a Demo
              <ArrowRight size={13} strokeWidth={2} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Nav grid ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="border-t border-slate-100 pt-12 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-16">
            <div className="col-span-2 sm:col-span-1">
              <a href="/astrorank" className="flex items-center gap-2.5 mb-3">
                <div className="relative w-7 h-7 shrink-0">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="#1D4ED8"/>
                    <path d="M16 5L19.5 11.5H26L20.5 15.8L23 23L16 19L9 23L11.5 15.8L6 11.5H12.5L16 5Z" fill="white"/>
                    <circle cx="16" cy="15" r="3.5" fill="#BFDBFE" fillOpacity="0.8"/>
                  </svg>
                </div>
                <span className="text-[16px] font-black tracking-[-0.045em] text-slate-900 leading-none">
                  Astro<span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Rank</span>
                </span>
              </a>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[210px]">
                AI-powered SEO that writes, optimizes, and publishes content automatically.
              </p>
            </div>
            {NAV.map(col => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="border-t border-slate-100 py-5 flex items-center justify-center">
          <p className="text-[12px] text-slate-400">© 2026 AstroRank. All rights reserved.</p>
        </div>
      </div>

      {/* ── Background wordmark ─────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none select-none"
        style={{ overflow: "hidden" }}
      >
        <span
          className="whitespace-nowrap font-black text-slate-900"
          style={{ fontSize: "clamp(60px, 14vw, 220px)", opacity: 0.05, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: "8px" }}
        >
          ASTRORANK
        </span>
      </div>
    </footer>
  );
}
