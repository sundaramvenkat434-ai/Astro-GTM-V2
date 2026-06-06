'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Globe, Brain, Palette, CircleCheck as CheckCircle2 } from 'lucide-react';

const actions = [
  { icon: Globe, text: 'Connecting to website...', done: 'Connected' },
  { icon: Brain, text: 'Understanding business...', done: 'Business analyzed' },
  { icon: CheckCircle2, text: 'Extracting brand intelligence...', done: 'Intelligence extracted' },
  { icon: Palette, text: 'Learning design system...', done: 'Design system mapped' },
];

const brandCard = {
  industry: 'SaaS',
  audience: 'Marketers',
  tone: 'Professional',
  match: '98%',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.6 } },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

export function BrandStep() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p < actions.length ? p + 1 : p));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* URL input */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#02140F] border border-emerald-500/20">
        <Globe className="w-4 h-4 text-emerald-500/60" />
        <span className="text-sm font-mono text-emerald-300">https://yourbrand.com</span>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Action list */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
        {actions.map((action, i) => {
          const isDone = i < progress;
          return (
            <motion.div
              key={action.text}
              variants={item}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                isDone ? 'bg-emerald-500/5 border border-emerald-500/15' : 'border border-transparent'
              }`}
            >
              <action.icon className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-gray-600'}`} />
              <span className={`text-sm ${isDone ? 'text-emerald-300' : 'text-gray-500'}`}>
                {isDone ? action.done : action.text}
              </span>
              {isDone && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-emerald-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Brand Intelligence Card */}
      {progress >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
        >
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">Brand Intelligence</p>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(brandCard).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-[10px] text-gray-500 capitalize">{key === 'match' ? 'Brand Match' : key}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
