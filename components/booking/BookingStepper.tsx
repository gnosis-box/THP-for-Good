'use client';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { MotionStepConnector, MotionStepIndicator } from '@/components/motion/stepper';
import { UI_COPY } from '@/lib/ui-copy';

const STEPS = [
  UI_COPY.booking.stepTime,
  UI_COPY.booking.stepDetails,
  UI_COPY.booking.stepPay,
] as const;

type Props = {
  hasSlot: boolean;
  hasEmail: boolean;
};

function stepIndex(hasSlot: boolean, hasEmail: boolean): number {
  if (!hasSlot) return 0;
  if (!hasEmail) return 1;
  return 2;
}

export function BookingStepper({ hasSlot, hasEmail }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const current = stepIndex(hasSlot, hasEmail);
  const currentStep = current + 1;

  return (
    <div className="flex items-center gap-0" role="list" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const stepNumber = i + 1;
        const isNotLast = i < STEPS.length - 1;
        return (
          <div key={label} className="flex flex-1 items-center">
            <MotionStepIndicator
              step={stepNumber}
              currentStep={currentStep}
              label={label}
              reducedMotion={reducedMotion}
            />
            {isNotLast ? (
              <MotionStepConnector isComplete={currentStep > stepNumber} reducedMotion={reducedMotion} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
