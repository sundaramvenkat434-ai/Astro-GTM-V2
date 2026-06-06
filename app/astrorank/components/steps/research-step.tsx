'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, ChartBar as BarChart2 } from 'lucide-react';

const serpResults = [
  { title: 'Best AI Tools for Marketing 2026 | TechReview', url: 'techreview.com/ai-marketing-tools', position: 3 },
  { title: 'Top SEO Automation Software Compared', url: 'seoweekly.io/automation-reviews', position: 5 },
  { title: 'How to Scale Content Marketing with AI', url: 'contentscale.com/ai-guide', position: 8 },
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
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Search results */}
      <div className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-50 bg-emerald-50/30">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">best AI tools for marketing</span>
        </div>
        <div className="p-2 space-y-0.5">
          {serpResults.map((r, i) => (
            <motion.div
              key={r.url}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: stage > 0 ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.12 }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-emerald-50/40"
            >
              <span className="text-[10px] font-mono text-gray-400 w-4">#{r.position}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-blue-700 truncate">{r.title}</p>
                <p className="text-[10px] text-green-700 truncate">{r.url}</p>
              </div>
              {stage > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }} className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                  Analyzed
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
          className="flex-1 rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-50 bg-emerald-50/30">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-500" /> Keywords
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">12,482 found</span>
          </div>
          <div className="px-3 py-0.5">
            <div className="grid grid-cols-[1fr_36px_28px_36px] gap-2 text-[9px] uppercase tracking-wider text-gray-400 font-semibold py-1.5 border-b border-emerald-50">
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
                className="grid grid-cols-[1fr_36px_28px_36px] gap-2 py-1.5 border-b border-emerald-50/50 last:border-0 text-[11px]"
              >
                <span className="text-gray-700 font-medium truncate">{kw.word}</span>
                <span className="text-right text-gray-500">{kw.vol}</span>
                <span className="text-right text-gray-400">{kw.kd}</span>
                <span className="text-right text-emerald-600 font-semibold">{kw.trend}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {stage >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="grid grid-cols-3 gap-2"
        >
          {[
            { icon: Users, val: '47', label: 'Competitors', bg: 'bg-blue-50', color: 'text-blue-600' },
            { icon: Search, val: '12,482', label: 'Keywords', bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { icon: TrendingUp, val: '684', label: 'Gaps Found', bg: 'bg-amber-50', color: 'text-amber-600' },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="p-2.5 rounded-xl border border-emerald-100 bg-white shadow-sm text-center"
            >
              <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center mx-auto mb-1`}>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
              <p className="text-sm font-bold text-gray-800">{m.val}</p>
              <p className="text-[9px] text-gray-400">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
