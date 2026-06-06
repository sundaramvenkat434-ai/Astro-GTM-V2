'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, TrendingUp, Users, Eye, Sparkles } from 'lucide-react';

const seoChecks = ['Meta Tags', 'Schema Markup', 'Internal Links', 'Image Alt'];

const analytics = [
  { icon: Eye, value: '+129', label: 'Organic Visitors', trend: '+34%' },
  { icon: Users, value: '+18', label: 'New Signups', trend: '+22%' },
  { icon: TrendingUp, value: 'Top 10', label: 'Ranking', trend: 'Page 1' },
];

export function PublishStep() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 16, 100));
    }, 120);
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2400),
    ];
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* Publishing progress */}
      <div className="rounded-xl border border-emerald-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-50 bg-emerald-50/30">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Publishing Article
          </p>
          <span className="text-[10px] font-mono text-gray-500">{progress}%</span>
        </div>
        <div className="p-3">
          <div className="h-2 rounded-full bg-emerald-50 overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-[width] duration-75" style={{ width: `${progress}%` }} />
          </div>
          {/* Article preview */}
          <div className="rounded-lg border border-emerald-100/50 bg-emerald-50/20 p-3 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-44 rounded bg-gray-300" />
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="h-2 w-5/6 rounded bg-gray-200" />
              </div>
              <div className="w-14 h-14 rounded-lg bg-emerald-100 border border-emerald-200 shrink-0" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-4 w-16 rounded bg-emerald-50 border border-emerald-200" />
              <div className="h-4 w-12 rounded bg-blue-50 border border-blue-200" />
            </div>
          </div>
        </div>
      </div>

      {/* SEO checks */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="rounded-xl border border-emerald-100 bg-white shadow-sm p-3"
        >
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">SEO Optimization</p>
          <div className="grid grid-cols-4 gap-2">
            {seoChecks.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-emerald-50 border border-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[8px] text-emerald-700 font-medium text-center leading-tight">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Analytics */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="grid grid-cols-3 gap-2"
        >
          {analytics.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="p-3 rounded-xl border border-emerald-100 bg-white shadow-sm text-center"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-1.5">
                <a.icon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">{a.value}</p>
              <p className="text-[8px] text-gray-400">{a.label}</p>
              <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">{a.trend}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
