'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const HEADER_OFFSET_PX = 56; // h-14 — matches layout Header

type Props = {
  children: ReactNode;
};

function collectScrollRoots(node: HTMLElement | null): EventTarget[] {
  const roots: EventTarget[] = [window];
  let el: HTMLElement | null = node?.parentElement ?? null;

  while (el) {
    const style = getComputedStyle(el);
    const scrollableY = /(auto|scroll|overlay)/.test(style.overflowY);
    if (scrollableY && el.scrollHeight > el.clientHeight) {
      roots.push(el);
    }
    el = el.parentElement;
  }

  return roots;
}

/**
 * Keeps profile preview visible under the app header while scrolling.
 * Uses fixed positioning (iframe-safe) when the preview top reaches the header.
 */
export function RegisterStickyPreview({ children }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [layout, setLayout] = useState({ height: 0, left: 0, width: 0 });

  useEffect(() => {
    const anchor = anchorRef.current;
    const preview = previewRef.current;
    if (!anchor || !preview) return;

    let raf = 0;

    const checkPin = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const top = anchor.getBoundingClientRect().top;
        const shouldPin = top <= HEADER_OFFSET_PX;
        const rect = preview.getBoundingClientRect();

        setLayout({ height: rect.height, left: rect.left, width: rect.width });
        setPinned(shouldPin);
      });
    };

    checkPin();

    const resizeObserver = new ResizeObserver(checkPin);
    resizeObserver.observe(preview);

    const scrollRoots = collectScrollRoots(anchor);
    scrollRoots.forEach((root) => root.addEventListener('scroll', checkPin, { passive: true }));
    window.addEventListener('resize', checkPin);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      scrollRoots.forEach((root) => root.removeEventListener('scroll', checkPin));
      window.removeEventListener('resize', checkPin);
    };
  }, []);

  return (
    <div ref={anchorRef}>
      <div style={pinned ? { height: layout.height } : undefined}>
        <div
          ref={previewRef}
          className={cn(
            pinned &&
              'fixed z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85',
          )}
          style={
            pinned
              ? {
                  top: HEADER_OFFSET_PX,
                  left: layout.left,
                  width: layout.width,
                }
              : undefined
          }
        >
          <div className="mx-auto w-full max-w-lg px-4 pb-3 md:max-w-2xl md:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
