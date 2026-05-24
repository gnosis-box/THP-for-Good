'use client';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { motionClass } from '@/lib/motion';
import { UI_COPY } from '@/lib/ui-copy';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export function PayDrawer({ open, onOpenChange, children }: Props) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>{UI_COPY.booking.stepPay}</DrawerTitle>
          <DrawerDescription>{UI_COPY.booking.reviewAndPay}</DrawerDescription>
        </DrawerHeader>
        <div
          className={motionClass(
            'overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]',
            open ? 'pay-drawer-stagger' : '',
            reducedMotion,
          )}
        >
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
