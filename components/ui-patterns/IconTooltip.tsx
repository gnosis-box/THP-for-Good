'use client';

import {
  cloneElement,
  isValidElement,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';

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

function subscribe() {
  return () => {};
}

function renderTriggerOnly(render: ReactElement, children?: ReactNode) {
  return isValidElement(render) ? cloneElement(render, {}, children) : render;
}

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
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);

  // Base UI TooltipTrigger + render prop mismatches SSR markup (data-slot, ids).
  if (!isClient) {
    return renderTriggerOnly(render, children);
  }

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
