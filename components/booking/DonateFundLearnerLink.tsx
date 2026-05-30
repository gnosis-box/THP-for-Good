import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { PAY_COPY } from '@/lib/pay-copy';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function DonateFundLearnerLink({ className }: Props) {
  return (
    <Link
      href="/about#donate"
      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'min-h-11 w-fit', className)}
    >
      {PAY_COPY.donateCta}
    </Link>
  );
}
