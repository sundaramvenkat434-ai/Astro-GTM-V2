'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, Calendar, ChartBar as BarChart3 } from 'lucide-react';

const keywords = [
  { keyword: 'AI SEO Tool', volume: '18K', comp: 'Med', compColor: 'text-yellow-400' },
  { keyword: 'SEO Automation', volume: '9K', comp: 'Low', compColor: 'text-green-400' },
  { keyword: 'Content Scaling', volume: '12K', comp: 'Low', compColor: 'text-green-400' },
];

const pages = [
  { title: 'Best AI SEO Tools', path: '/best-ai-seo-tools', priority: 'High' },
  { title: 'SEO Automation Guide', path: '/seo-automation-guide', priority: 'High' },
  { title: 'Content Growth Strategy', path: '/content-growth-strategy', priority: 'Med' },
];

export function PlanStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 800),
      setTimeout(() => setStage(2), 2500),
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
      {/* Keyword strategy table */}
      <div className="p-3 rounded-xl bg-[#0A0714] border border-violet-500/10">
        <div className="flex items-center gap-2 mb-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider">Keyword Strategy</p>
        </div>
        <div className="space-y-0">
          <div className="grid grid-cols-[1fr_50px_44px] gap-2 text-[8px] uppercase tracking-wider text-slate-600 pb-1.5 border-b border-violet-500/10">
            <span>Keyword</span>
            <span className="text-center">Volume</span>
            <span className="text-right">Comp</span>
          </div>
          {keywords.map((kw, i) => (
            <motion.div
              key={kw.keyword}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="grid grid-cols-[1fr_50px_44px] gap-2 py-2 border-b border-violet-500/5 last:border-0"
            >
              <span className="text-[11px] text-white font-medium truncate">{kw.keyword}</span>
              <span className="text-[11px] text-violet-300 text-center">{kw.volume}</span>
              <span className={`text-[11px] font-medium text-right ${kw.compColor}`}>{kw.comp}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generated page cards */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-3 rounded-xl bg-[#0A0714] border border-violet-500/10"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Content Plan
            </p>
            <span className="text-[9px] text-violet-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> This week
            </span>
          </div>
          <div className="space-y-1.5">
            {pages.map((page, i) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-[#080510]/60 border border-violet-500/5"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${page.priority === 'High' ? 'bg-violet-400' : 'bg-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white font-medium truncate">{page.title}</p>
                  <p className="text-[9px] text-slate-600 font-mono truncate">{page.path}</p>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded ${page.priority === 'High' ? 'bg-violet-500/10 text-violet-300' : 'bg-slate-700/30 text-slate-500'}`}>
                  {page.priority}
                </span>
              </motion.div>
            ))}
          </div>
          {stage >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-violet-400/70 font-medium mt-2 text-center"
            >
              +247 more pages queued for publishing
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
