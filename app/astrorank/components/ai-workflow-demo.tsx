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
const STEP_DURATION = 6000;

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
      <div className="absolute -inset-6 rounded-3xl bg-emerald-500/5 blur-3xl pointer-events-none" />

      <AnimatedBrowser>
        <WorkflowStepper steps={STEPS} activeStep={activeStep} onStepClick={setActiveStep} duration={STEP_DURATION} />

        <div className="relative h-[340px] sm:h-[350px] mt-3 overflow-hidden">
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
