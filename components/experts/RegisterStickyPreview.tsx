'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const HEADER_OFFSET_PX = 56; // h-14 — matches layout Header

type Props = {
  children: ReactNode;
};

/**
 * Keeps profile preview visible under the app header while scrolling.
 * Uses fixed positioning (iframe-safe) once the sentinel scrolls past the header.
 */
export function RegisterStickyPreview({ children }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setPinned(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return;

    const updateHeight = () => setPreviewHeight(node.offsetHeight);
    updateHeight();

    const ro = new ResizeObserver(updateHeight);
    ro.observe(node);
    return () => ro.disconnect();
  }, [children]);

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-px w-full shrink-0" aria-hidden />
      {pinned ? <div aria-hidden style={{ height: previewHeight }} /> : null}
      <div
        ref={previewRef}
        className={cn(
          pinned &&
            'fixed inset-x-0 top-14 z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85',
        )}
      >
        <div className="mx-auto w-full max-w-lg px-4 pb-3 md:max-w-2xl md:px-6">{children}</div>
      </div>
    </>
  );
}
