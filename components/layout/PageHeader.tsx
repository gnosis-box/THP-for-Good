import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col items-center gap-2 text-center', className)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="max-w-lg text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      {children}
    </header>
  );
}
