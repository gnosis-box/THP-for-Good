'use client';

type SlotPickerProps = {
  calendarLink: string;
};

export function SlotPicker({ calendarLink }: SlotPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Availability</p>
      <p className="text-sm text-muted-foreground">
        Check the mentor&apos;s available slots, then come back here to confirm your session with a CRC payment.
      </p>
      <a
        href={calendarLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        View available slots ↗
      </a>
    </div>
  );
}
