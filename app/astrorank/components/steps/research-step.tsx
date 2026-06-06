'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, ChartBar as BarChart2 } from 'lucide-react';

const serpResults = [
  { title: 'Best AI Tools for Marketing 2026', url: 'competitor-a.com', position: 3 },
  { title: 'SEO Automation Software Reviews', url: 'competitor-b.com', position: 5 },
  { title: 'Content Marketing at Scale', url: 'competitor-c.com', position: 8 },
];

const keywords = [
  { word: 'AI SEO tool', vol: '18K', diff: 32 },
  { word: 'content automation', vol: '12K', diff: 24 },
  { word: 'programmatic SEO', vol: '9K', diff: 18 },
  { word: 'SEO scaling software', vol: '6K', diff: 15 },
];

export function ResearchStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 700),
      setTimeout(() => setStage(2), 2000),
      setTimeout(() => setStage(3), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Google SERP simulation */}
      <div className="p-3 rounded-xl bg-[#0A0714] border border-violet-500/10">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#080510] border border-violet-500/15 mb-2.5">
          <Search className="w-3.5 h-3.5 text-violet-400/50" />
          <span className="text-xs text-slate-400 font-mono">best AI tools for marketing</span>
        </div>
        <div className="space-y-1.5">
          {serpResults.map((r, i) => (
            <motion.div
              key={r.url}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: stage > 0 ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-violet-500/5"
            >
              <span className="text-[9px] font-mono text-slate-600 w-4">#{r.position}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-violet-200 truncate">{r.title}</p>
                <p className="text-[9px] text-slate-600 truncate">{r.url}</p>
              </div>
              {stage > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[8px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                  Scraped
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Keyword discovery */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-3 rounded-xl bg-[#0A0714] border border-violet-500/10"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Keywords Discovered
            </p>
            <span className="text-[9px] font-mono text-violet-400">12,482 found</span>
          </div>
          <div className="space-y-1">
            {keywords.map((kw, i) => (
              <motion.div
                key={kw.word}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span className="flex-1 text-slate-300 truncate">{kw.word}</span>
                <span className="text-violet-300 font-medium w-10 text-right">{kw.vol}</span>
                <div className="w-12 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400" style={{ width: `${kw.diff}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Metrics row */}
      {stage >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { icon: Users, val: '47', label: 'Competitors' },
            { icon: Search, val: '12,482', label: 'Keywords' },
            { icon: TrendingUp, val: '684', label: 'Opportunities' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-2 rounded-lg border border-violet-500/10 bg-violet-500/5 text-center"
            >
              <m.icon className="w-3.5 h-3.5 text-violet-400 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-white">{m.val}</p>
              <p className="text-[8px] text-slate-500">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
