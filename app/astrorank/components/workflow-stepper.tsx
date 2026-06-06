'use client';

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
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[#071510] border border-emerald-500/10">
      {steps.map((step, i) => {
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        return (
          <button
            key={step}
            onClick={() => onStepClick(i)}
            className="flex-1 relative"
          >
            <div className={`flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-md text-[11px] font-semibold transition-all duration-150 ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                : isPast
                ? 'text-emerald-400/50 border border-transparent'
                : 'text-slate-600 border border-transparent'
            }`}>
              <span className={`w-4.5 h-4.5 flex items-center justify-center rounded-full text-[9px] font-bold shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : isPast
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-800 text-slate-500'
              }`} style={{ width: '18px', height: '18px' }}>
                {isPast ? '\u2713' : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${progress * 100}%`, transition: 'none' }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
