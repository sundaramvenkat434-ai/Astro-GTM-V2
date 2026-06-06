'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FileText, ChartBar as BarChart3 } from 'lucide-react';

const keywords = [
  { keyword: 'AI SEO Tool', volume: '18K', competition: 'Medium' },
  { keyword: 'SEO Automation', volume: '9K', competition: 'Low' },
  { keyword: 'Content Scaling', volume: '12K', competition: 'Low' },
];

const pages = [
  '/best-ai-seo-tools',
  '/seo-automation-guide',
  '/content-growth-strategy',
];

export function PlanStep() {
  const [showPages, setShowPages] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPages(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Strategy header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">SEO Strategy</span>
      </div>

      {/* Keywords table */}
      <div className="rounded-lg border border-emerald-500/15 overflow-hidden">
        <div className="grid grid-cols-3 gap-0 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-[#02140F] px-3 py-2">
          <span>Keyword</span>
          <span className="text-center">Volume</span>
          <span className="text-right">Competition</span>
        </div>
        {keywords.map((kw, i) => (
          <motion.div
            key={kw.keyword}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
            className="grid grid-cols-3 gap-0 px-3 py-2.5 border-t border-emerald-500/10"
          >
            <span className="text-sm text-white font-medium">{kw.keyword}</span>
            <span className="text-sm text-emerald-300 text-center">{kw.volume}</span>
            <span className={`text-sm text-right font-medium ${kw.competition === 'Low' ? 'text-green-400' : 'text-yellow-400'}`}>
              {kw.competition}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Generated pages */}
      {showPages && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-gray-400">Generated Page Ideas</span>
          </div>
          <div className="space-y-1.5">
            {pages.map((page, i) => (
              <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#02140F] border border-emerald-500/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-emerald-200 font-mono">{page}</span>
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-emerald-400/70 font-medium pl-1"
          >
            +247 more pages queued
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}
