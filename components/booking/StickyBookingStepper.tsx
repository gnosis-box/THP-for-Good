'use client';

import { useEffect, useRef, useState } from 'react';
import { BookingStepper } from '@/components/booking/BookingStepper';
import { cn } from '@/lib/utils';

const HEADER_OFFSET_PX = 56; // h-14 in Header

type Props = {
  hasSlot: boolean;
  hasEmail: boolean;
  hasContext: boolean;
  className?: string;
};

function collectScrollRoots(node: HTMLElement | null): EventTarget[] {
  const roots: EventTarget[] = [window];
  let el: HTMLElement | null = node?.parentElement ?? null;

  while (el) {
    const style = getComputedStyle(el);
    const scrollableY = /(auto|scroll|overlay)/.test(style.overflowY);
    if (scrollableY && el.scrollHeight > el.clientHeight) roots.push(el);
    el = el.parentElement;
  }

  return roots;
}

export function StickyBookingStepper({ hasSlot, hasEmail, hasContext, className }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [layout, setLayout] = useState({ height: 0, left: 0, width: 0 });

  useEffect(() => {
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!anchor || !content) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const anchorTop = anchor.getBoundingClientRect().top;
        const rect = content.getBoundingClientRect();
        setPinned(anchorTop <= HEADER_OFFSET_PX);
        setLayout({ height: rect.height, left: rect.left, width: rect.width });
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(content);

    const roots = collectScrollRoots(anchor);
    roots.forEach((root) => root.addEventListener('scroll', update, { passive: true }));
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      roots.forEach((root) => root.removeEventListener('scroll', update));
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={anchorRef} className={className}>
      <div style={pinned ? { height: layout.height } : undefined}>
        <div
          ref={contentRef}
          className={cn('border-y border-border/60 bg-background/95 py-2 backdrop-blur-sm', pinned && 'fixed z-20')}
          style={
            pinned
              ? {
                  top: 'calc(env(safe-area-inset-top) + 3.5rem)',
                  left: layout.left,
                  width: layout.width,
                }
              : undefined
          }
        >
          <div className="px-4 md:px-6">
            <BookingStepper hasSlot={hasSlot} hasEmail={hasEmail} hasContext={hasContext} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
