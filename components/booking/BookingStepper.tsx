'use client';

import { Fragment } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import {
  MotionStepConnector,
  MotionStepDisc,
  stepLabelClass,
  stepStatusLabel,
} from '@/components/motion/stepper';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

const STEPS = [
  UI_COPY.booking.stepTime,
  UI_COPY.booking.stepDetails,
  UI_COPY.booking.stepPay,
] as const;

type Props = {
  hasSlot: boolean;
  hasEmail: boolean;
  className?: string;
};

function stepIndex(hasSlot: boolean, hasEmail: boolean): number {
  if (!hasSlot) return 0;
  if (!hasEmail) return 1;
  return 2;
}

export function BookingStepper({ hasSlot, hasEmail, className }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const current = stepIndex(hasSlot, hasEmail);
  const currentStep = current + 1;

  return (
    <div
      className={cn('mx-auto w-full max-w-sm sm:max-w-md', className)}
      role="list"
      aria-label="Booking progress"
    >
      <div className="flex items-start">
        {STEPS.map((label, i) => {
          const stepNumber = i + 1;
          const isActive = currentStep === stepNumber;
          const isNotLast = i < STEPS.length - 1;

          return (
            <Fragment key={label}>
              <div
                className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="flex w-full items-center">
                  <div className="flex h-8 flex-1 items-center sm:h-9">
                    {i > 0 ? (
                      <MotionStepConnector
                        isComplete={currentStep > i}
                        reducedMotion={reducedMotion}
                        className="w-full"
                      />
                    ) : null}
                  </div>
                  <MotionStepDisc
                    step={stepNumber}
                    currentStep={currentStep}
                    reducedMotion={reducedMotion}
                  />
                  <div className="flex h-8 flex-1 items-center sm:h-9">
                    {isNotLast ? (
                      <MotionStepConnector
                        isComplete={currentStep > stepNumber}
                        reducedMotion={reducedMotion}
                        className="w-full"
                      />
                    ) : null}
                  </div>
                </div>
                <span className={stepLabelClass(isActive)}>
                  {label}
                  <span className="sr-only">{` — ${stepStatusLabel(stepNumber, currentStep)}`}</span>
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
