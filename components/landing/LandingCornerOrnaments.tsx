'use client';

import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';

type SwirlPixel = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
};

/**
 * Deterministic pixel positions along a logarithmic-ish spiral, snapped to a
 * grid so the trail reads as "pixel volutes" rather than a smooth curve.
 */
function buildSwirlPixels(): SwirlPixel[] {
  const GRID = 6;
  const TURNS = 3;
  const STEPS = 52;
  const pixels: SwirlPixel[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < STEPS; i++) {
    const t = i / (STEPS - 1);
    const theta = t * TURNS * Math.PI * 2;
    const radius = 5 + t * 50;
    const gx = Math.round((60 + Math.cos(theta) * radius) / GRID) * GRID;
    const gy = Math.round((60 + Math.sin(theta) * radius) / GRID) * GRID;
    const key = `${gx},${gy}`;
    if (seen.has(key)) continue;
    seen.add(key);

    pixels.push({
      x: gx,
      y: gy,
      size: t < 0.45 ? 5 : 4,
      opacity: Math.max(0.12, 0.75 - t * 0.6),
      delay: i * 70,
    });
  }

  return pixels;
}

const SWIRL_PIXELS = buildSwirlPixels();

function CornerSwirl({
  className,
  spinClass,
  reducedMotion,
}: {
  className?: string;
  spinClass: string;
  reducedMotion: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={cn(
        'h-28 w-28 sm:h-32 sm:w-32',
        motionClass('', spinClass, reducedMotion),
        className,
      )}
    >
      {SWIRL_PIXELS.map((px) => (
        <rect
          key={`${px.x}-${px.y}`}
          x={px.x - px.size / 2}
          y={px.y - px.size / 2}
          width={px.size}
          height={px.size}
          rx={0.5}
          fill="currentColor"
          className={motionClass('', 'landing-pixel-twinkle', reducedMotion)}
          style={
            reducedMotion
              ? { opacity: px.opacity }
              : ({
                  opacity: px.opacity,
                  '--px-op': px.opacity,
                  animationDelay: `${px.delay}ms`,
                } as React.CSSProperties)
          }
        />
      ))}
    </svg>
  );
}

export function LandingCornerOrnaments() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-56" aria-hidden>
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-primary/25 blur-3xl landing-corner-glow" />
      <CornerSwirl
        spinClass="landing-swirl-spin"
        reducedMotion={reducedMotion}
        className="absolute bottom-3 left-1 text-primary sm:bottom-5 sm:left-5"
      />

      <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl landing-corner-glow [animation-delay:2.5s]" />
      <CornerSwirl
        spinClass="landing-swirl-spin-reverse"
        reducedMotion={reducedMotion}
        className="absolute bottom-3 right-1 text-accent sm:bottom-5 sm:right-5"
      />
    </div>
  );
}
