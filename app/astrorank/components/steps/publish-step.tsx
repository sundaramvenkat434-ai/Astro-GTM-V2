'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2, TrendingUp, Users, Star } from 'lucide-react';

const badges = ['Meta Optimized', 'Schema Added', 'Internal Links Created'];

const notifications = [
  { icon: TrendingUp, text: '+129 Organic Visitors', color: 'text-emerald-300' },
  { icon: Users, text: '+18 Signups', color: 'text-green-300' },
  { icon: Star, text: 'Keyword entered Top 10', color: 'text-emerald-200' },
];

const sections = ['Introduction', 'Comparison Table', 'FAQs', 'Expert Verdict'];

export function PublishStep() {
  const [progress, setProgress] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 100));
    }, 300);
    const notifTimer = setTimeout(() => setShowNotifs(true), 3200);
    return () => {
      clearInterval(interval);
      clearTimeout(notifTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-300">Publishing page...</span>
          <span className="text-xs font-mono text-gray-500">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#02140F] border border-emerald-500/15 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Article preview */}
      <div className="p-3 rounded-xl border border-emerald-500/15 bg-[#02140F]/60">
        <p className="text-sm font-bold text-white mb-2">Best AI SEO Tools in 2026</p>
        <div className="space-y-1.5">
          {sections.map((section, i) => (
            <motion.div
              key={section}
              initial={{ opacity: 0 }}
              animate={{ opacity: progress > i * 25 ? 1 : 0.3 }}
              className="flex items-center gap-2"
            >
              <div className={`w-3 h-3 rounded-sm ${progress > i * 25 ? 'bg-emerald-500/30' : 'bg-gray-700/30'}`} />
              <span className={`text-xs ${progress > i * 25 ? 'text-gray-300' : 'text-gray-600'}`}>{section}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success badges */}
      {progress >= 100 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {badges.map((badge, i) => (
            <motion.span
              key={badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300"
            >
              <CheckCircle2 className="w-3 h-3" />
              {badge}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Growth notifications */}
      {showNotifs && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {notifications.map((notif, i) => (
            <motion.div
              key={notif.text}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5"
            >
              <notif.icon className={`w-4 h-4 ${notif.color}`} />
              <span className={`text-sm font-medium ${notif.color}`}>{notif.text}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
