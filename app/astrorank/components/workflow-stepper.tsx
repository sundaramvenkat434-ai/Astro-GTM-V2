'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WorkflowStepperProps {
  steps: readonly string[];
  activeStep: number;
  onStepClick: (i: number) => void;
  duration: number;
}

export function WorkflowStepper({ steps, activeStep, onStepClick, duration }: WorkflowStepperProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    let raf: number;
    function tick() {
      const elapsed = Date.now() - start;
      setProgress(Math.min(elapsed / duration, 1));
      if (elapsed < duration) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeStep, duration]);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        return (
          <button
            key={step}
            onClick={() => onStepClick(i)}
            className="flex-1 relative"
          >
            <div className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                : isPast
                ? 'bg-emerald-500/5 text-emerald-400/60 border border-transparent'
                : 'text-slate-600 border border-transparent'
            }`}>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : isPast
                  ? 'bg-emerald-500/30 text-emerald-300'
                  : 'bg-slate-700/50 text-slate-500'
              }`}>
                {isPast ? '\u2713' : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-900/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
