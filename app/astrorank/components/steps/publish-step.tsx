'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, TrendingUp, Users, Eye, Sparkles } from 'lucide-react';

const seoChecks = ['Meta Tags', 'Schema', 'Int. Links', 'Alt Text'];

const analytics = [
  { icon: Eye, value: '+129', label: 'Visitors', trend: '+34%' },
  { icon: Users, value: '+18', label: 'Signups', trend: '+22%' },
  { icon: TrendingUp, value: 'Top 10', label: 'Ranking', trend: 'Pg 1' },
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
      className="absolute inset-0 flex flex-col gap-2.5"
    >
      {/* Publishing card */}
      <div className="rounded-lg border border-emerald-500/10 bg-[#071510] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-500/5 bg-[#0a1f16]">
          <p className="text-[10px] font-semibold text-emerald-300/60 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Publishing
          </p>
          <span className="text-[9px] font-mono text-emerald-400/50">{progress}%</span>
        </div>
        <div className="p-3">
          <div className="h-1.5 rounded-full bg-emerald-900/20 overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-[width] duration-75" style={{ width: `${progress}%` }} />
          </div>
          {/* Article wireframe */}
          <div className="rounded border border-emerald-500/5 bg-[#0a1f16] p-2.5 space-y-1.5">
            <div className="flex items-start gap-2.5">
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-40 rounded-sm bg-white/10" />
                <div className="h-1.5 w-full rounded-sm bg-white/5" />
                <div className="h-1.5 w-5/6 rounded-sm bg-white/5" />
              </div>
              <div className="w-12 h-12 rounded bg-emerald-500/10 border border-emerald-500/10 shrink-0" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="h-3.5 w-14 rounded-sm bg-emerald-500/10 border border-emerald-500/10" />
              <div className="h-3.5 w-10 rounded-sm bg-emerald-500/5" />
            </div>
          </div>
        </div>
      </div>

      {/* SEO checklist */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          className="rounded-lg border border-emerald-500/10 bg-[#071510] p-2.5"
        >
          <p className="text-[9px] font-semibold text-emerald-300/40 uppercase tracking-wider mb-2">SEO Optimization</p>
          <div className="grid grid-cols-4 gap-1.5">
            {seoChecks.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1 p-1.5 rounded bg-emerald-500/5 border border-emerald-500/8"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[8px] text-emerald-300/50 font-medium text-center leading-tight">{item}</span>
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
              className="p-2.5 rounded-lg border border-emerald-500/10 bg-[#071510] text-center"
            >
              <a.icon className="w-4 h-4 text-emerald-400/70 mx-auto mb-1" />
              <p className="text-[13px] font-bold text-white">{a.value}</p>
              <p className="text-[8px] text-emerald-300/30">{a.label}</p>
              <p className="text-[8px] text-emerald-400 font-semibold mt-0.5">{a.trend}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
