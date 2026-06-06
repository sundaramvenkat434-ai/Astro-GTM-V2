'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, ChartBar as BarChart2 } from 'lucide-react';

const serpResults = [
  { title: 'Best AI Tools for Marketing 2026', url: 'techreview.com/ai-tools', position: 3 },
  { title: 'SEO Automation Software Reviews', url: 'seoweekly.io/reviews', position: 5 },
  { title: 'Content Marketing at Scale Guide', url: 'contentscale.com/guide', position: 8 },
];

const keywords = [
  { word: 'AI SEO tool', vol: '18K', kd: 32, trend: '+12%' },
  { word: 'content automation', vol: '12K', kd: 24, trend: '+8%' },
  { word: 'programmatic SEO', vol: '9K', kd: 18, trend: '+22%' },
  { word: 'SEO scaling', vol: '6K', kd: 15, trend: '+15%' },
];

export function ResearchStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-2.5"
    >
      {/* SERP simulation */}
      <div className="rounded-lg border border-emerald-500/10 bg-[#071510] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/5 bg-[#0a1f16]">
          <Search className="w-3.5 h-3.5 text-emerald-400/40" />
          <span className="text-[11px] text-emerald-200/50 font-mono">best AI tools for marketing</span>
        </div>
        <div className="p-2 space-y-0.5">
          {serpResults.map((r, i) => (
            <motion.div
              key={r.url}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: stage > 0 ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.12 }}
              className="flex items-center gap-2 px-2 py-1.5 rounded"
            >
              <span className="text-[9px] font-mono text-emerald-500/30 w-4">#{r.position}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-emerald-100/80 truncate">{r.title}</p>
                <p className="text-[9px] text-emerald-400/30 truncate">{r.url}</p>
              </div>
              {stage > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="text-[8px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15 shrink-0">
                  Scraped
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Keyword table */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 rounded-lg border border-emerald-500/10 bg-[#071510] overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-500/5 bg-[#0a1f16]">
            <p className="text-[10px] font-semibold text-emerald-300/60 flex items-center gap-1.5">
              <BarChart2 className="w-3 h-3" /> Keywords
            </p>
            <span className="text-[9px] font-mono text-emerald-400/60">12,482 found</span>
          </div>
          <div className="px-3 py-1">
            <div className="grid grid-cols-[1fr_36px_28px_36px] gap-2 text-[8px] uppercase tracking-wider text-emerald-400/30 font-semibold py-1.5 border-b border-emerald-500/5">
              <span>Keyword</span>
              <span className="text-right">Vol</span>
              <span className="text-right">KD</span>
              <span className="text-right">Trend</span>
            </div>
            {keywords.map((kw, i) => (
              <motion.div
                key={kw.word}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[1fr_36px_28px_36px] gap-2 py-1.5 border-b border-emerald-500/3 last:border-0 text-[11px]"
              >
                <span className="text-white/80 font-medium truncate">{kw.word}</span>
                <span className="text-right text-emerald-300/50">{kw.vol}</span>
                <span className="text-right text-emerald-300/40">{kw.kd}</span>
                <span className="text-right text-emerald-400 font-medium">{kw.trend}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary metrics */}
      {stage >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { icon: Users, val: '47', label: 'Competitors' },
            { icon: Search, val: '12,482', label: 'Keywords' },
            { icon: TrendingUp, val: '684', label: 'Gaps Found' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="p-2 rounded-lg border border-emerald-500/10 bg-[#071510] text-center"
            >
              <m.icon className="w-3.5 h-3.5 text-emerald-400/60 mx-auto mb-0.5" />
              <p className="text-[12px] font-bold text-white">{m.val}</p>
              <p className="text-[8px] text-emerald-300/30">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
