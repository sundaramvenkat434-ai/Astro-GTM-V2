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
  { title: 'Best AI SEO Tools in 2026', path: '/best-ai-seo-tools', status: 'Ready' },
  { title: 'Complete SEO Automation Guide', path: '/seo-automation-guide', status: 'Ready' },
  { title: 'Content Growth Strategy', path: '/content-growth-strategy', status: 'Queued' },
];

export function PlanStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 700),
      setTimeout(() => setStage(2), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Content strategy table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Keyword Strategy
          </p>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> This week
          </span>
        </div>
        <div className="px-3">
          <div className="grid grid-cols-[1fr_44px_36px_40px] gap-2 text-[9px] uppercase tracking-wider text-gray-400 font-semibold py-2 border-b border-gray-50">
            <span>Keyword</span>
            <span className="text-center">Vol</span>
            <span className="text-center">Comp</span>
            <span className="text-right">Score</span>
          </div>
          {keywords.map((kw, i) => (
            <motion.div
              key={kw.keyword}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-[1fr_44px_36px_40px] gap-2 py-2 border-b border-gray-50 last:border-0 items-center"
            >
              <span className="text-xs text-gray-700 font-medium truncate">{kw.keyword}</span>
              <span className="text-[11px] text-gray-500 text-center">{kw.volume}</span>
              <span className={`text-[10px] font-medium text-center ${kw.comp === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>{kw.comp}</span>
              <div className="flex items-center justify-end gap-1">
                <div className="w-8 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${kw.score}%` }} />
                </div>
                <span className="text-[9px] text-gray-500">{kw.score}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generated content plan */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" /> Content Plan
            </p>
            <span className="text-[10px] font-medium text-emerald-600">250 pages total</span>
          </div>
          <div className="p-2.5 space-y-1.5">
            {pages.map((page, i) => (
              <motion.div
                key={page.path}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className={`w-2 h-2 rounded-full ${page.status === 'Ready' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 font-medium truncate">{page.title}</p>
                  <p className="text-[10px] text-gray-400 font-mono truncate">{page.path}</p>
                </div>
                <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${
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
              +247 more pages queued for this month
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
