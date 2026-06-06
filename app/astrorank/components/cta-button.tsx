'use client';

import { motion } from 'framer-motion';

export function CTAButton() {
  return (
    <motion.a
      href="#start"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 transition-shadow duration-200 relative overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <span className="relative z-10">Start Free Trial</span>
      <svg className="relative z-10 w-5 h-5 transition-transform duration-150 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.a>
  );
}
