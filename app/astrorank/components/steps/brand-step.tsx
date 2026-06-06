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
      className="absolute inset-0 flex flex-col gap-3"
    >
      {/* URL input card */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shrink-0 shadow-sm">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">yourbrand.com</p>
          <p className="text-[11px] text-gray-500">{stage >= 2 ? 'Analysis complete' : 'Scanning pages...'}</p>
        </div>
        {stage < 2 ? (
          <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </motion.div>
        )}
      </div>

      {/* Extracted visuals */}
      {stage >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Website preview */}
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <div className="h-4 bg-gray-50 border-b border-gray-100 flex items-center px-2 gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
            </div>
            <div className="p-2.5 space-y-1.5">
              <div className="h-2.5 w-16 rounded bg-emerald-200" />
              <div className="h-2 w-full rounded bg-gray-100" />
              <div className="h-2 w-3/4 rounded bg-gray-100" />
              <div className="flex gap-1.5 mt-2">
                <div className="h-5 w-14 rounded bg-emerald-100 border border-emerald-200" />
                <div className="h-5 w-14 rounded bg-gray-50 border border-gray-200" />
              </div>
            </div>
          </div>

          {/* Colors & font */}
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm space-y-2.5">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Colors</p>
              <div className="flex gap-1.5">
                {['#10B981', '#059669', '#1F2937', '#F3F4F6'].map((c) => (
                  <div key={c} className="w-6 h-6 rounded-md border border-gray-200 shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Font</p>
              <p className="text-sm font-bold text-gray-800">Inter</p>
              <p className="text-[10px] text-gray-400">Semi / Bold / Extra</p>
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
          className="flex-1 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-semibold text-gray-700">Brand Intelligence</p>
            {stage >= 3 && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                98% Match
              </motion.span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
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
                transition={{ delay: i * 0.04 }}
                className="text-center p-2 rounded-lg bg-gray-50 border border-gray-100"
              >
                <p className="text-[8px] text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{m.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3">
            {['CTAs: 8', 'Tone: 94%', 'Mapped'].map((text, i) => (
              <span key={i} className="text-[10px] text-gray-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
