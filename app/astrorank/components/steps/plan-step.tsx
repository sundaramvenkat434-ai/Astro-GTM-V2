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
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Strategy table */}
      <div className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-50 bg-emerald-50/30">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Keyword Strategy
          </p>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> This week
          </span>
        </div>
        <div className="px-3">
          <div className="grid grid-cols-[1fr_40px_32px_40px] gap-2 text-[9px] uppercase tracking-wider text-gray-400 font-semibold py-1.5 border-b border-emerald-50">
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
              className="grid grid-cols-[1fr_40px_32px_40px] gap-2 py-2 border-b border-emerald-50/50 last:border-0 items-center"
            >
              <span className="text-xs text-gray-700 font-medium truncate">{kw.keyword}</span>
              <span className="text-[10px] text-gray-500 text-center">{kw.volume}</span>
              <span className={`text-[9px] font-semibold text-center ${kw.comp === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>{kw.comp}</span>
              <div className="flex items-center justify-end gap-1">
                <div className="w-7 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${kw.score}%` }} />
                </div>
                <span className="text-[9px] text-gray-500">{kw.score}</span>
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
          className="flex-1 rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-50 bg-emerald-50/30">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Content Plan
            </p>
            <span className="text-[10px] font-semibold text-emerald-600">250 pages</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {pages.map((page, i) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100/50"
              >
                <div className={`w-2 h-2 rounded-full ${page.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-700 font-medium truncate">{page.title}</p>
                  <p className="text-[9px] text-gray-400 font-mono truncate">{page.path}</p>
                </div>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                  page.status === 'Ready'
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                    : 'text-amber-600 bg-amber-50 border-amber-100'
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
              className="px-3 pb-2.5 flex items-center gap-1.5 text-[10px] text-gray-400"
            >
              <Clock className="w-3 h-3" />
              +247 more queued this month
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
