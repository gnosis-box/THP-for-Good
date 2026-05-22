'use client';

type SlotPickerProps = {
  calendarLink: string;
};

export function SlotPicker({ calendarLink }: SlotPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Available slots</p>
      <iframe
        src={calendarLink}
        style={{ border: 0 }}
        width="100%"
        height="600"
        frameBorder={0}
        title="Booking calendar"
      />
    </div>
  );
}
