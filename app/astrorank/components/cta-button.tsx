'use client';

import { motion } from 'framer-motion';

export function CTAButton() {
  return (
    <motion.a
      href="#start"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl font-bold text-[15px] text-white overflow-hidden shadow-2xl shadow-black/50"
    >
      {/* Very dark green base */}
      <span className="absolute inset-0 bg-gradient-to-r from-[#022b18] via-[#064e30] to-[#053d26]" />

      {/* Hover layer */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#053d26] via-[#059669] to-[#064e30]" />

      {/* Shimmer sweep */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/8 to-transparent animate-[shimmer_3s_infinite]" />
      </span>

      {/* Top edge highlight */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      {/* Bottom shadow */}
      <span className="absolute inset-x-0 bottom-0 h-px bg-black/30" />

      <span className="relative z-10">Start Free Trial</span>
      <svg className="relative z-10 w-5 h-5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.a>
  );
}
