'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TrustRelationState } from '@/hooks/use-trust-relation';

type Props = {
  relation: TrustRelationState;
  className?: string;
};

export function TrustRelationBadge({ relation, className }: Props) {
  if (relation.status === 'loading') {
    return (
      <Badge variant="secondary" className={cn('text-[10px] font-normal animate-pulse', className)}>
        Trust…
      </Badge>
    );
  }

  if (relation.status === 'mutual') {
    return (
      <Badge
        variant="secondary"
        className={cn('border-trust/30 bg-trust/10 text-trust text-[10px] font-medium', className)}
      >
        Mutual trust
      </Badge>
    );
  }

  if (relation.status === 'outgoing') {
    return (
      <Badge
        variant="secondary"
        className={cn('border-trust/20 bg-muted text-muted-foreground text-[10px] font-medium', className)}
      >
        You trust
      </Badge>
    );
  }

  if (relation.status === 'incoming') {
    return (
      <Badge
        variant="secondary"
        className={cn('border-trust/20 bg-muted text-muted-foreground text-[10px] font-medium', className)}
      >
        Trusts you
      </Badge>
    );
  }

  return null;
}
