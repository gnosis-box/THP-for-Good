'use client';

import type { SVGProps } from 'react';
import { motion, type Variants } from 'motion/react';

import { cn } from '@/lib/utils';

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

type StepIndicatorProps = {
  step: number;
  currentStep: number;
  label: string;
  reducedMotion?: boolean;
};

export function MotionStepIndicator({
  step,
  currentStep,
  label,
  reducedMotion = false,
}: StepIndicatorProps) {
  const status =
    currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  if (reducedMotion) {
    const done = currentStep > step;
    const active = currentStep === step;
    return (
      <div className="flex flex-1 flex-col items-center gap-1.5" role="listitem" aria-current={active ? 'step' : undefined}>
        <div
          className={cn(
            'flex size-8 min-h-8 min-w-8 items-center justify-center rounded-full border text-xs font-semibold sm:size-9',
            done && 'border-primary bg-primary text-primary-foreground',
            active && !done && 'border-primary text-primary',
            !done && !active && 'border-border text-muted-foreground',
          )}
          aria-hidden
        >
          {done ? <CheckIcon className="size-4" aria-hidden /> : step}
        </div>
        <span
          className={cn(
            'text-center text-xs font-medium leading-snug',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" role="listitem" aria-current={status === 'active' ? 'step' : undefined}>
      <motion.div animate={status} initial={false} className="relative outline-none">
        <motion.div
          variants={{
            inactive: { scale: 1 },
            active: { scale: 1.05 },
            complete: { scale: 1 },
          }}
          transition={{ duration: 0.25 }}
          className={cn(
            'flex size-8 min-h-8 min-w-8 items-center justify-center rounded-full border text-xs font-semibold sm:size-9',
            status === 'inactive' && 'border-border bg-muted text-muted-foreground',
            status === 'active' && 'border-primary bg-primary/15 text-primary ring-2 ring-primary/40',
            status === 'complete' && 'border-primary bg-primary text-primary-foreground',
          )}
          aria-hidden
        >
          {status === 'complete' ? (
            <CheckIcon className="size-4" aria-hidden />
          ) : (
            step
          )}
        </motion.div>
      </motion.div>
      <span
        className={cn(
          'text-center text-xs font-medium leading-snug',
          status === 'active' ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
        <span className="sr-only">{` — ${status === 'complete' ? 'completed' : status === 'active' ? 'current' : 'upcoming'}`}</span>
      </span>
    </div>
  );
}

type StepConnectorProps = {
  isComplete: boolean;
  reducedMotion?: boolean;
};

export function MotionStepConnector({ isComplete, reducedMotion = false }: StepConnectorProps) {
  if (reducedMotion) {
    return (
      <div
        className={cn('mx-1 h-0.5 w-full max-w-8 flex-1 rounded-full sm:max-w-12', isComplete ? 'bg-primary' : 'bg-border')}
        aria-hidden
      />
    );
  }

  const lineVariants: Variants = {
    incomplete: { scaleX: 0 },
    complete: { scaleX: 1 },
  };

  return (
    <div className="relative mx-1 h-0.5 w-full max-w-8 flex-1 overflow-hidden rounded-full bg-border sm:max-w-12">
      <motion.div
        className="absolute left-0 top-0 h-full w-full origin-left bg-primary"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </div>
  );
}
