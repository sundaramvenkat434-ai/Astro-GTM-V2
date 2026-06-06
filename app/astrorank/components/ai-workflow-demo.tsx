'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedBrowser } from './animated-browser';
import { WorkflowStepper } from './workflow-stepper';
import { BrandStep } from './steps/brand-step';
import { ResearchStep } from './steps/research-step';
import { PlanStep } from './steps/plan-step';
import { PublishStep } from './steps/publish-step';

const STEPS = ['Brand', 'Research', 'Plan', 'Publish'] as const;
const STEP_DURATION = 7000;

export function AIWorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:max-w-none">
      {/* Glow behind browser */}
      <div className="absolute -inset-6 rounded-3xl bg-violet-500/5 blur-3xl pointer-events-none" />
      <div className="absolute -inset-3 rounded-2xl bg-purple-500/3 blur-xl pointer-events-none" />

      <AnimatedBrowser>
        <WorkflowStepper steps={STEPS} activeStep={activeStep} onStepClick={setActiveStep} duration={STEP_DURATION} />

        {/* Fixed-height content container */}
        <div className="relative h-[320px] sm:h-[340px] mt-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeStep === 0 && <BrandStep key="brand" />}
            {activeStep === 1 && <ResearchStep key="research" />}
            {activeStep === 2 && <PlanStep key="plan" />}
            {activeStep === 3 && <PublishStep key="publish" />}
          </AnimatePresence>
        </div>
      </AnimatedBrowser>
    </div>
  );
}
