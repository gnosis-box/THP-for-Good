'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const FLASH_MS = 600;

/** Brief row highlight after admin mutation — M-P2-07 */
export function useRowFlash() {
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerFlash = useCallback((id: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFlashKey(id);
    timerRef.current = setTimeout(() => {
      setFlashKey(null);
      timerRef.current = null;
    }, FLASH_MS);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return { flashKey, triggerFlash };
}
