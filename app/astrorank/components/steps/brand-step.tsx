'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Globe, CircleCheck as CheckCircle2, Loader as Loader2 } from 'lucide-react';

export function BrandStep() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 400),
      setTimeout(() => setStage(2), 1200),
      setTimeout(() => setStage(3), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col gap-2.5"
    >
      {/* URL input bar */}
      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#071510] border border-emerald-500/10">
        <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white">yourbrand.com</p>
          <p className="text-[10px] text-emerald-300/40">{stage >= 2 ? 'Analysis complete' : 'Scanning pages...'}</p>
        </div>
        {stage < 2 ? (
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </motion.div>
        )}
      </div>

      {/* Extracted visuals */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-2 gap-2"
        >
          {/* Website screenshot mock */}
          <div className="rounded-lg border border-emerald-500/10 overflow-hidden bg-[#071510]">
            <div className="h-3.5 bg-[#0a1f16] border-b border-emerald-500/10 flex items-center px-2 gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
            </div>
            <div className="p-2 space-y-1.5">
              <div className="h-2.5 w-14 rounded-sm bg-emerald-500/20" />
              <div className="h-1.5 w-full rounded-sm bg-emerald-500/5" />
              <div className="h-1.5 w-3/4 rounded-sm bg-emerald-500/5" />
              <div className="flex gap-1 mt-1.5">
                <div className="h-4 w-12 rounded-sm bg-emerald-500/15 border border-emerald-500/20" />
                <div className="h-4 w-12 rounded-sm bg-emerald-500/5" />
              </div>
            </div>
          </div>

          {/* Colors & fonts */}
          <div className="rounded-lg border border-emerald-500/10 bg-[#071510] p-2.5 space-y-2.5">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-emerald-400/40 font-semibold mb-1.5">Colors</p>
              <div className="flex gap-1.5">
                {['#10B981', '#059669', '#1F2937', '#F9FAFB'].map((c) => (
                  <div key={c} className="w-5 h-5 rounded border border-emerald-500/20" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-emerald-400/40 font-semibold mb-1">Font</p>
              <p className="text-[12px] font-bold text-white leading-none">Inter</p>
              <p className="text-[9px] text-emerald-300/30 mt-0.5">Semi / Bold / Extra</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Brand intelligence */}
      {stage >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 rounded-lg border border-emerald-500/10 bg-[#071510] p-2.5"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-emerald-300/70 uppercase tracking-wider">Brand Intelligence</p>
            {stage >= 3 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                98% Match
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Industry', value: 'SaaS' },
              { label: 'Audience', value: 'Marketers' },
              { label: 'Tone', value: 'Professional' },
              { label: 'Pages', value: '24' },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.1 }}
                className="text-center p-1.5 rounded bg-emerald-500/5 border border-emerald-500/5"
              >
                <p className="text-[8px] text-emerald-400/40 uppercase">{m.label}</p>
                <p className="text-[11px] font-bold text-white mt-0.5">{m.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3">
            {['CTAs: 8', 'Tone: 94%', 'Mapped'].map((text, i) => (
              <span key={i} className="text-[9px] text-emerald-300/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500/60" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
