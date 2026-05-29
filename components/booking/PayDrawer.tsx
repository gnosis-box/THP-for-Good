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
  /** Shown when the drawer is open but prerequisites (e.g. valid email) are not met. */
  gateMessage?: string | null;
};

export function PayDrawer({ open, onOpenChange, children, gateMessage }: Props) {
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
          {gateMessage ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{gateMessage}</p>
          ) : (
            children
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
