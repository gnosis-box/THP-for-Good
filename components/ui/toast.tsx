'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';

type Toast = { id: number; message: string; variant: 'default' | 'error' };

type ToastContextValue = {
  showToast: (message: string, variant?: 'default' | 'error') => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

const TOAST_DURATION_MS = 4500;
const TOAST_EXIT_MS = 200;

function ToastItem({
  toast,
  reducedMotion,
  onDismiss,
}: {
  toast: Toast;
  reducedMotion: boolean;
  onDismiss: (id: number) => void;
}) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setTimeout(() => setExiting(true), TOAST_DURATION_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(() => onDismiss(toast.id), reducedMotion ? 0 : TOAST_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [exiting, onDismiss, reducedMotion, toast.id]);

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg',
        toast.variant === 'error'
          ? 'border-destructive/50 bg-destructive text-destructive-foreground'
          : 'border-border bg-background text-foreground',
        motionClass('', exiting ? 'motion-toast-out' : 'motion-toast-in', reducedMotion),
      )}
    >
      {toast.message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, variant: 'default' | 'error' = 'default') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-4"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} reducedMotion={reducedMotion} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
