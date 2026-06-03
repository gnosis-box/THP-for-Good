'use client';

import type { ReactElement, ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TooltipSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';

type Props = {
  content: string;
  render: ReactElement;
  children?: ReactNode;
  side?: TooltipSide;
  sideOffset?: number;
  delay?: number;
  closeOnClick?: boolean;
};

/** Hover tooltip for icon-only or compact controls (desktop affordance; keep aria-label on trigger). */
export function IconTooltip({
  content,
  render,
  children,
  side = 'bottom',
  sideOffset = 6,
  delay = 0,
  closeOnClick = false,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger delay={delay} closeOnClick={closeOnClick} render={render}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={sideOffset}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
