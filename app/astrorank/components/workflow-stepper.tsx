'use client';

import { motion } from 'framer-motion';

interface WorkflowStepperProps {
  steps: readonly string[];
  activeStep: number;
  onStepClick: (i: number) => void;
}

export function WorkflowStepper({ steps, activeStep, onStepClick }: WorkflowStepperProps) {
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
            <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : isPast
                ? 'bg-emerald-500/5 text-emerald-500/60 border border-transparent'
                : 'text-gray-600 border border-transparent'
            }`}>
              <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : isPast
                  ? 'bg-emerald-500/30 text-emerald-300'
                  : 'bg-gray-700/50 text-gray-500'
              }`}>
                {isPast ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </div>
            {isActive && (
              <motion.div
                layoutId="step-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
