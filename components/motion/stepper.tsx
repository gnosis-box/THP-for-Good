'use client';

import type { SVGProps } from 'react';
import { Fragment } from 'react';
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

type StepStatus = 'active' | 'inactive' | 'complete';

function getStepStatus(step: number, currentStep: number): StepStatus {
  if (currentStep === step) return 'active';
  if (currentStep < step) return 'inactive';
  return 'complete';
}

type StepDiscProps = {
  step: number;
  currentStep: number;
  reducedMotion?: boolean;
  className?: string;
};

export function MotionStepDisc({
  step,
  currentStep,
  reducedMotion = false,
  className,
}: StepDiscProps) {
  const status = getStepStatus(step, currentStep);

  if (reducedMotion) {
    const done = currentStep > step;
    const active = currentStep === step;
    return (
      <div
        className={cn(
          'flex size-8 min-h-8 min-w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold sm:size-9',
          done && 'border-primary bg-primary text-primary-foreground',
          active && !done && 'border-primary text-primary',
          !done && !active && 'border-border text-muted-foreground',
          className,
        )}
        aria-hidden
      >
        {done ? <CheckIcon className="size-4" aria-hidden /> : step}
      </div>
    );
  }

  return (
    <motion.div animate={status} initial={false} className={cn('relative shrink-0 outline-none', className)}>
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
        {status === 'complete' ? <CheckIcon className="size-4" aria-hidden /> : step}
      </motion.div>
    </motion.div>
  );
}

type StepIndicatorProps = {
  step: number;
  currentStep: number;
  label: string;
  reducedMotion?: boolean;
  className?: string;
};

export function MotionStepIndicator({
  step,
  currentStep,
  label,
  reducedMotion = false,
  className,
}: StepIndicatorProps) {
  const status = getStepStatus(step, currentStep);

  return (
    <div
      className={cn('flex shrink-0 flex-col items-center gap-1.5', className)}
      role="listitem"
      aria-current={status === 'active' ? 'step' : undefined}
    >
      <MotionStepDisc step={step} currentStep={currentStep} reducedMotion={reducedMotion} />
      <span
        className={cn(
          'max-w-[5.5rem] text-center text-xs font-medium leading-snug sm:max-w-none',
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
  className?: string;
};

export function MotionStepConnector({
  isComplete,
  reducedMotion = false,
  className,
}: StepConnectorProps) {
  if (reducedMotion) {
    return (
      <div
        className={cn(
          'h-0.5 w-full rounded-full',
          isComplete ? 'bg-primary' : 'bg-border',
          className,
        )}
        aria-hidden
      />
    );
  }

  const lineVariants: Variants = {
    incomplete: { scaleX: 0 },
    complete: { scaleX: 1 },
  };

  return (
    <div className={cn('relative h-0.5 w-full overflow-hidden rounded-full bg-border', className)}>
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

export function stepLabelClass(active: boolean) {
  return cn(
    'max-w-[5.5rem] text-center text-xs font-medium leading-snug sm:max-w-none',
    active ? 'text-foreground' : 'text-muted-foreground',
  );
}

export function stepStatusLabel(step: number, currentStep: number) {
  const status = getStepStatus(step, currentStep);
  return status === 'complete' ? 'completed' : status === 'active' ? 'current' : 'upcoming';
}
