"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const NAV = [
  {
    title: "Product",
    links: [
      { label: "Features",     href: "#" },
      { label: "Pricing",      href: "#" },
      { label: "How It Works", href: "#" },
      { label: "Early Access", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",   href: "/about"   },
      { label: "Blog",    href: "/articles" },
      { label: "Contact", href: "/contact" },
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

// ─── Link column ──────────────────────────────────────────────────────────────
function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3.5">
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

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function AstroRankFooter() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <footer
      ref={ref}
      className="relative bg-[#FAFAFC] border-t border-slate-200 overflow-hidden"
    >
      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 pt-20 pb-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Ready to outrank your competitors?
          </h2>
          <p className="text-[16px] text-slate-500 mb-8 leading-relaxed">
            Join early access and get your first 10 pages free.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:from-blue-500 hover:to-blue-400 transition-all duration-200"
            >
              Join Early Access
            </motion.button>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150"
            >
              Book a Demo <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="border-t border-slate-200 pt-12 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-16">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[17px] font-black tracking-[-0.04em] text-slate-900 mb-2.5 block">
                ASTRORANK
              </span>
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-[200px]">
                AI-powered SEO that writes, optimizes, and publishes content automatically.
              </p>
            </div>

            {NAV.map(col => (
              <FooterCol key={col.title} title={col.title} links={col.links} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-12">
        <div className="border-t border-slate-200 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-400">
            © 2026 AstroRank. All rights reserved.
          </p>
          <p className="text-[12px] text-slate-400">
            Built with AI. Designed for growth.
          </p>
        </div>
      </div>

      {/* ── Background wordmark ───────────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none select-none"
        style={{ transform: "translateY(16%)" }}
      >
        <span
          className="text-[#0F172A] whitespace-nowrap font-black"
          style={{
            fontSize: "clamp(72px, 18vw, 300px)",
            opacity: 0.035,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          ASTRORANK
        </span>
      </div>
    </footer>
  );
}
