'use client';

import { Pin, PinOff } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

const HEADER_OFFSET_PX = 56; // h-14 — matches layout Header
const STICKY_PREF_KEY = 'thp-register-preview-sticky';

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

function readStickyPref(): boolean {
  try {
    return sessionStorage.getItem(STICKY_PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

function writeStickyPref(enabled: boolean) {
  try {
    sessionStorage.setItem(STICKY_PREF_KEY, enabled ? 'on' : 'off');
  } catch {
    // sessionStorage unavailable (private mode, iframe restrictions)
  }
}

/**
 * Keeps profile preview visible under the app header while scrolling.
 * Users can disable pinning if the sticky behaviour misbehaves in their host.
 */
export function RegisterStickyPreview({ children }: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [stickyEnabled, setStickyEnabled] = useState(true);
  const [scrollPinned, setScrollPinned] = useState(false);
  const [layout, setLayout] = useState({ height: 0, left: 0, width: 0 });

  const isFixed = stickyEnabled && scrollPinned;

  useEffect(() => {
    setStickyEnabled(readStickyPref());
  }, []);

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
        setScrollPinned(shouldPin);
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

  function enableSticky() {
    setStickyEnabled(true);
    writeStickyPref(true);
  }

  function disableSticky() {
    setStickyEnabled(false);
    writeStickyPref(false);
  }

  return (
    <div ref={anchorRef}>
      {!stickyEnabled ? (
        <div className="flex justify-end pb-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 text-muted-foreground"
            onClick={enableSticky}
          >
            <Pin aria-hidden />
            {UI_COPY.register.previewPin}
          </Button>
        </div>
      ) : null}

      <div style={isFixed ? { height: layout.height } : undefined}>
        <div
          ref={previewRef}
          className={cn(
            isFixed &&
              'fixed z-20 border-b border-border/60 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85',
          )}
          style={
            isFixed
              ? {
                  top: HEADER_OFFSET_PX,
                  left: layout.left,
                  width: layout.width,
                }
              : undefined
          }
        >
          <div className="mx-auto w-full max-w-lg px-4 pb-3 md:max-w-2xl md:px-6">
            {isFixed ? (
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-7 text-muted-foreground"
                  onClick={disableSticky}
                >
                  <PinOff aria-hidden />
                  {UI_COPY.register.previewUnpin}
                </Button>
              </div>
            ) : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
