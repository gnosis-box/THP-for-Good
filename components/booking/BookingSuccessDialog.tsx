'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Dialog } from '@base-ui/react/dialog';
import { CheckCircle2, XIcon } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { playBookingSuccessSound } from '@/lib/booking-success-sound';
import { UI_COPY } from '@/lib/ui-copy';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorName: string;
  slotLabel: string;
  txHash: string;
  calendarEventUrl: string | null;
  calendarLink: string;
  calInviteSent: boolean;
};

export function BookingSuccessDialog({
  open,
  onOpenChange,
  mentorName,
  slotLabel,
  txHash,
  calendarEventUrl,
  calendarLink,
  calInviteSent,
}: Props) {
  const copy = UI_COPY.booking;

  useEffect(() => {
    if (open) playBookingSuccessSound();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-xs',
            'data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
          )}
        />
        <Dialog.Popup
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-border bg-popover p-6 shadow-xl outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-4',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            'duration-300',
          )}
        >
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3"
                aria-label="Close"
              />
            }
          >
            <XIcon />
          </Dialog.Close>

          <div className="flex flex-col items-center gap-4 pt-2 text-center">
            <div className="booking-success-icon flex size-16 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="size-10 text-success" strokeWidth={2} />
            </div>

            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-lg font-semibold tracking-tight">
                {copy.successDialogTitle}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {copy.successDialogSubtitle(mentorName)}
              </Dialog.Description>
            </div>

            <p className="text-sm font-medium text-foreground">{slotLabel}</p>

            <p className="text-xs text-muted-foreground">
              {calInviteSent ? copy.successDialogCalEmail : copy.successDialogCalManual}
            </p>

            <a
              href={`https://explorer.aboutcircles.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-xs text-trust underline underline-offset-2"
            >
              {txHash.slice(0, 10)}…{txHash.slice(-8)}
            </a>

            <div className="flex w-full flex-col gap-2 pt-1">
              <Link
                href="/calls?tab=emitted"
                className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'min-h-11 w-full')}
                onClick={() => onOpenChange(false)}
              >
                {copy.successDialogViewCalls}
              </Link>

              {calendarEventUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() =>
                    window.open(calendarEventUrl, '_blank', 'noopener,noreferrer')
                  }
                >
                  {copy.openCalBooking}
                </Button>
              ) : calendarLink ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={() => window.open(calendarLink, '_blank', 'noopener,noreferrer')}
                >
                  {copy.openExpertCalendar}
                </Button>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                className="min-h-11 w-full text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                {copy.successDialogStay}
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
