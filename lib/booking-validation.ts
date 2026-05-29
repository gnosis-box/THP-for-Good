/** Booking flow: slot → valid email → pay. */

export type BookingStep = 0 | 1 | 2;

const BOOKING_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBookingEmail(email: string): boolean {
  return BOOKING_EMAIL_RE.test(email.trim());
}

export function getBookingStep(hasSlot: boolean, isValidEmail: boolean): BookingStep {
  if (!hasSlot) return 0;
  if (!isValidEmail) return 1;
  return 2;
}
