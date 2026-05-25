'use client';

import { forwardRef, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
};

/** Progressive disclosure section — M-P2-06 */
export const CollapsibleSection = forwardRef<HTMLDetailsElement, Props>(
  function CollapsibleSection(
    { title, defaultOpen = false, className, id, children },
    ref,
  ) {
    const reducedMotion = usePrefersReducedMotion();

    return (
      <details
        ref={ref}
        id={id}
        open={defaultOpen}
        className={cn(
          'group rounded-xl border border-border bg-muted/20',
          !reducedMotion && 'motion-collapsible',
          className,
        )}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
          {title}
          <span
            aria-hidden
            className="text-muted-foreground transition-transform duration-[var(--motion-normal)] group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <div className="motion-collapsible-body">
          <div className="min-h-0 flex flex-col gap-4">{children}</div>
        </div>
      </details>
    );
  },
);
