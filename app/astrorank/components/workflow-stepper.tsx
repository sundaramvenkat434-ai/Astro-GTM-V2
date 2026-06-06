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
    <div className="flex items-center gap-0.5 p-1 rounded-lg bg-white border border-gray-200 shadow-sm">
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
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isPast
                ? 'text-emerald-600 border border-transparent'
                : 'text-gray-400 border border-transparent'
            }`}>
              <span className={`flex items-center justify-center rounded-full text-[9px] font-bold shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isPast
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-400'
              }`} style={{ width: '18px', height: '18px' }}>
                {isPast ? '\u2713' : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </div>
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
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
