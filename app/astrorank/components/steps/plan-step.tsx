'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, Calendar, ChartBar as BarChart3, Clock } from 'lucide-react';

const keywords = [
  { keyword: 'AI SEO Tool', volume: '18K', comp: 'Med', score: 87 },
  { keyword: 'SEO Automation', volume: '9K', comp: 'Low', score: 94 },
  { keyword: 'Content Scaling', volume: '12K', comp: 'Low', score: 91 },
];

const pages = [
  { title: 'Best AI SEO Tools 2026', path: '/best-ai-seo-tools', status: 'Ready' },
  { title: 'SEO Automation Guide', path: '/seo-automation-guide', status: 'Ready' },
  { title: 'Content Growth Strategy', path: '/content-growth', status: 'Queued' },
];

export function PlanStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1800),
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
      {/* Strategy table */}
      <div className="rounded-lg border border-emerald-500/10 bg-[#071510] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-500/5 bg-[#0a1f16]">
          <p className="text-[10px] font-semibold text-emerald-300/60 flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3" /> Keyword Strategy
          </p>
          <span className="text-[9px] text-emerald-400/40 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> This week
          </span>
        </div>
        <div className="px-3">
          <div className="grid grid-cols-[1fr_36px_30px_36px] gap-2 text-[8px] uppercase tracking-wider text-emerald-400/30 font-semibold py-1.5 border-b border-emerald-500/5">
            <span>Keyword</span>
            <span className="text-center">Vol</span>
            <span className="text-center">Comp</span>
            <span className="text-right">Score</span>
          </div>
          {keywords.map((kw, i) => (
            <motion.div
              key={kw.keyword}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[1fr_36px_30px_36px] gap-2 py-1.5 border-b border-emerald-500/3 last:border-0 items-center"
            >
              <span className="text-[11px] text-white/80 font-medium truncate">{kw.keyword}</span>
              <span className="text-[10px] text-emerald-300/50 text-center">{kw.volume}</span>
              <span className={`text-[9px] font-semibold text-center ${kw.comp === 'Low' ? 'text-emerald-400' : 'text-amber-400/70'}`}>{kw.comp}</span>
              <div className="flex items-center justify-end gap-1">
                <div className="w-6 h-1 rounded-full bg-emerald-900/30 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${kw.score}%` }} />
                </div>
                <span className="text-[8px] text-emerald-300/40">{kw.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Content plan */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 rounded-lg border border-emerald-500/10 bg-[#071510] overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-500/5 bg-[#0a1f16]">
            <p className="text-[10px] font-semibold text-emerald-300/60 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Content Plan
            </p>
            <span className="text-[9px] font-mono text-emerald-400/50">250 pages</span>
          </div>
          <div className="p-2 space-y-1">
            {pages.map((page, i) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2 p-2 rounded bg-emerald-500/3 border border-emerald-500/5"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${page.status === 'Ready' ? 'bg-emerald-400' : 'bg-amber-400/70'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/80 font-medium truncate">{page.title}</p>
                  <p className="text-[9px] text-emerald-400/30 font-mono truncate">{page.path}</p>
                </div>
                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
                  page.status === 'Ready'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/15'
                    : 'text-amber-400/70 bg-amber-500/5 border border-amber-500/10'
                }`}>
                  {page.status}
                </span>
              </motion.div>
            ))}
          </div>
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 pb-2 flex items-center gap-1.5 text-[9px] text-emerald-400/30"
            >
              <Clock className="w-3 h-3" />
              +247 more queued
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
