'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, TrendingUp, Users, Eye, FileCheck } from 'lucide-react';

const checklistItems = ['Meta Optimized', 'Schema Added', 'Internal Links', 'Alt Text Done'];

const analytics = [
  { icon: Eye, value: '+129', label: 'Visitors', color: 'text-emerald-300' },
  { icon: Users, value: '+18', label: 'Signups', color: 'text-green-300' },
  { icon: TrendingUp, value: 'Top 10', label: 'Ranking', color: 'text-emerald-200' },
];

export function PublishStep() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 14, 100));
    }, 150);
    const timers = [
      setTimeout(() => setStage(1), 1600),
      setTimeout(() => setStage(2), 2800),
    ];
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-2.5"
    >
      {/* Progress + mini page preview */}
      <div className="p-3 rounded-xl bg-[#041A12] border border-emerald-500/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-emerald-300">Publishing: Best AI SEO Tools 2026</span>
          <span className="text-[10px] font-mono text-slate-500">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#021a0f] border border-emerald-500/10 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Mini wireframe */}
        <div className="rounded-lg bg-[#021a0f] border border-emerald-500/5 p-2 space-y-1">
          <div className="h-2 w-3/4 rounded bg-slate-700/40" />
          <div className="h-1.5 w-full rounded bg-slate-800/30" />
          <div className="h-1.5 w-5/6 rounded bg-slate-800/30" />
          <div className="flex gap-1.5 mt-1.5">
            <div className="h-6 flex-1 rounded bg-emerald-500/5 border border-emerald-500/10" />
            <div className="h-6 flex-1 rounded bg-emerald-500/5 border border-emerald-500/10" />
          </div>
        </div>
      </div>

      {/* SEO checklist */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="p-3 rounded-xl bg-[#041A12] border border-emerald-500/10"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-[9px] uppercase tracking-wider text-slate-600">SEO Checklist</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {checklistItems.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.1 }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/10"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-[10px] text-slate-300 truncate">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics cards */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-3 gap-2"
        >
          {analytics.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.12 }}
              className="p-2.5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 text-center"
            >
              <a.icon className={`w-4 h-4 mx-auto mb-1 ${a.color}`} />
              <p className={`text-sm font-bold ${a.color}`}>{a.value}</p>
              <p className="text-[8px] text-slate-500">{a.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
