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

const colors = ['#10B981', '#34D399', '#059669', '#6EE7B7'];

export function BrandStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1400),
      setTimeout(() => setStage(3), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-2.5"
    >
      {/* Website preview card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#041A12] border border-emerald-500/15">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">yourbrand.com</p>
          <p className="text-[11px] text-slate-500">{stage >= 1 ? 'Connected' : 'Connecting...'}</p>
        </div>
        {stage >= 1 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </motion.div>
        )}
      </div>

      {/* Extracted visuals */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-2"
        >
          <div className="flex-1 p-3 rounded-xl bg-[#041A12] border border-emerald-500/10">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-2">Logo & Colors</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600" />
              <div className="flex gap-1">
                {colors.map((c) => (
                  <div key={c} className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 p-3 rounded-xl bg-[#041A12] border border-emerald-500/10">
            <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-2">Typography</p>
            <p className="text-sm font-bold text-white leading-none">Inter</p>
            <p className="text-xs text-slate-400 mt-1">Aa Bb Cc 123</p>
          </div>
        </motion.div>
      )}

      {/* Brand Intelligence dashboard */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-3 rounded-xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-transparent"
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Brand Intelligence</p>
            {stage >= 3 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Complete
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {brandMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.15 }}
                className="text-center p-2 rounded-lg bg-[#021a0f]/60"
              >
                <p className="text-[9px] text-slate-500 mb-0.5">{m.label}</p>
                <p className="text-xs font-bold text-white">{m.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {['Pages Scanned', 'CTAs Found', 'Tone Score'].map((label, i) => (
              <div key={label} className="text-center">
                <p className="text-[9px] text-slate-600">{label}</p>
                <p className="text-xs font-semibold text-emerald-300">{['24', '8', '94%'][i]}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
