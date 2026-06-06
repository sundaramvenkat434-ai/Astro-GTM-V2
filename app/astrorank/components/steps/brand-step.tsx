'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Globe, CircleCheck as CheckCircle2 } from 'lucide-react';

const brandMetrics = [
  { label: 'Industry', value: 'SaaS' },
  { label: 'Audience', value: 'Marketers' },
  { label: 'Tone', value: 'Professional' },
  { label: 'Brand Match', value: '98%' },
];

const colors = ['#8B5CF6', '#A78BFA', '#6D28D9', '#C4B5FD'];

export function BrandStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 1800),
      setTimeout(() => setStage(3), 3200),
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
      {/* Website preview card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0714] border border-violet-500/15">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">yourbrand.com</p>
          <p className="text-[11px] text-slate-500">Connecting &amp; analyzing...</p>
        </div>
        {stage >= 1 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0">
            <CheckCircle2 className="w-5 h-5 text-violet-400" />
          </motion.div>
        )}
      </div>

      {/* Extracted visuals */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          {/* Logo mock */}
          <div className="flex-1 p-3 rounded-xl bg-[#0A0714] border border-violet-500/10">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-2">Logo & Colors</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600" />
              <div className="flex gap-1">
                {colors.map((c) => (
                  <div key={c} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          {/* Fonts mock */}
          <div className="flex-1 p-3 rounded-xl bg-[#0A0714] border border-violet-500/10">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-2">Typography</p>
            <p className="text-sm font-bold text-white leading-none">Inter</p>
            <p className="text-xs text-slate-400 mt-1">Aa Bb Cc 123</p>
          </div>
        </motion.div>
      )}

      {/* Brand Intelligence dashboard */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-3 rounded-xl border border-violet-500/15 bg-gradient-to-br from-violet-500/5 to-transparent"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">Brand Intelligence</p>
            {stage >= 3 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full">
                Complete
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {brandMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-2 rounded-lg bg-[#080510]/60"
              >
                <p className="text-[9px] text-slate-500 mb-0.5">{m.label}</p>
                <p className="text-xs font-bold text-white">{m.value}</p>
              </motion.div>
            ))}
          </div>
          {/* Progress indicators */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['Pages Scanned', 'CTAs Found', 'Tone Score'].map((label, i) => (
              <div key={label} className="text-center">
                <p className="text-[9px] text-slate-600">{label}</p>
                <p className="text-xs font-semibold text-violet-300">{['24', '8', '94%'][i]}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
