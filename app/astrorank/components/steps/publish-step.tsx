'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, TrendingUp, Users, Eye, Sparkles } from 'lucide-react';

const seoChecks = ['Meta Tags', 'Schema Markup', 'Internal Links', 'Image Alt'];

const analytics = [
  { icon: Eye, value: '+129', label: 'Organic Visitors', trend: '+34%' },
  { icon: Users, value: '+18', label: 'Signups', trend: '+22%' },
  { icon: TrendingUp, value: 'Top 10', label: 'Keyword Rank', trend: 'Page 1' },
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
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Article publishing preview */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Publishing Article
          </p>
          <span className="text-[10px] font-mono text-gray-400">{progress}%</span>
        </div>
        <div className="p-3">
          {/* Progress */}
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Mini article mockup */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-44 rounded bg-gray-800/80" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-5/6 rounded bg-gray-200" />
              </div>
              <div className="w-14 h-14 rounded-lg bg-emerald-100 border border-emerald-200 shrink-0" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-20 rounded-md bg-emerald-50 border border-emerald-100" />
              <div className="h-4 w-16 rounded-md bg-blue-50 border border-blue-100" />
              <div className="h-4 w-12 rounded-md bg-gray-50 border border-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* SEO checklist */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border border-gray-200 bg-white shadow-sm p-3"
        >
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">SEO Optimization</p>
          <div className="grid grid-cols-4 gap-2">
            {seoChecks.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-50 border border-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] text-emerald-700 font-medium text-center">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics results */}
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
              transition={{ delay: i * 0.06 }}
              className="p-3 rounded-xl border border-gray-200 bg-white shadow-sm text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-1.5">
                <a.icon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">{a.value}</p>
              <p className="text-[9px] text-gray-400">{a.label}</p>
              <p className="text-[9px] text-emerald-600 font-medium mt-0.5">{a.trend}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
