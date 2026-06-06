'use client';

import { motion } from 'framer-motion';

export function CTAButton() {
  return (
    <motion.a
      href="#start"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-shadow duration-300 relative overflow-hidden group"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">Start Free Trial</span>
      <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.a>
  );
}
