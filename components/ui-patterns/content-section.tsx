import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** Page section with left-aligned title — lists, tables, prose, forms. */
export function ContentSection({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Bordered info block — left-aligned title + body (e.g. how-to-read). */
export function ContentPanel({
  title,
  titleId,
  className,
  children,
}: {
  title: string;
  titleId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-muted/30 px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="text-sm font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
