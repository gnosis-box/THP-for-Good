/** Booking flow: slot → details (email + context) → pay. */

export type BookingStep = 0 | 1 | 2;

const BOOKING_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBookingEmail(email: string): boolean {
  return BOOKING_EMAIL_RE.test(email.trim());
}

export function isBookingDetailsComplete(isValidEmail: boolean, hasContext: boolean): boolean {
  return isValidEmail && hasContext;
}

export function getBookingStep(
  hasSlot: boolean,
  isValidEmail: boolean,
  hasContext: boolean,
): BookingStep {
  if (!hasSlot) return 0;
  if (!isBookingDetailsComplete(isValidEmail, hasContext)) return 1;
  return 2;
}
