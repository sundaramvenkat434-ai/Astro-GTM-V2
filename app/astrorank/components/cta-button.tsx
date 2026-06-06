'use client';

import { motion } from 'framer-motion';

export function CTAButton() {
  return (
    <motion.a
      href="#start"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2.5 px-9 py-4 rounded-xl font-bold text-[15px] text-white overflow-hidden shadow-xl shadow-emerald-900/40"
    >
      {/* Base dark gradient */}
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700" />

      {/* Animated shimmer */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600" />
      </span>

      {/* Flash sweep animation */}
      <span className="absolute inset-0 overflow-hidden">
        <span className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />
      </span>

      {/* Top highlight */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent" />

      <span className="relative z-10">Start Free Trial</span>
      <svg className="relative z-10 w-5 h-5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.a>
  );
}
