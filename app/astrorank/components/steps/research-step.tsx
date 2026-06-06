'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Target } from 'lucide-react';

const searches = [
  'best AI tools for marketing',
  'SEO automation software',
];

const metrics = [
  { label: 'Competitors Analyzed', value: 47, icon: Target },
  { label: 'Keywords Found', value: '12,482', icon: Search },
  { label: 'Growth Opportunities', value: 684, icon: TrendingUp },
];

export function ResearchStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Search cards */}
      <div className="space-y-2">
        {searches.map((query, i) => (
          <motion.div
            key={query}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: stage > i ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.4 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#02140F] border border-emerald-500/15"
          >
            <Search className="w-4 h-4 text-emerald-500/50" />
            <span className="text-sm text-gray-300 font-mono">{query}</span>
            {stage > i && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-auto text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"
              >
                Analyzed
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* SERP snippets */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1.5 pl-3 border-l-2 border-emerald-500/20"
        >
          {['Competitor discovery...', 'Keyword extraction...', 'Opportunity analysis...'].map((text, i) => (
            <motion.p
              key={text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.3 }}
              className="text-xs text-gray-500 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
              {text}
            </motion.p>
          ))}
        </motion.div>
      )}

      {/* Metrics */}
      {stage >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="p-3 rounded-xl border border-emerald-500/15 bg-emerald-500/5 text-center"
            >
              <m.icon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-base font-bold text-white">{m.value}</p>
              <p className="text-[10px] text-gray-500">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
