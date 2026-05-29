export const BOOKING_DOMAIN_MIN_LENGTH = 2;
export const BOOKING_DOMAIN_MAX_LENGTH = 80;
export const BOOKING_CONTEXT_MIN_LENGTH = 20;
export const BOOKING_CONTEXT_MAX_LENGTH = 1200;

export function normalizeBookingText(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isValidBookingDomain(value: string): boolean {
  const len = normalizeBookingText(value).length;
  return len >= BOOKING_DOMAIN_MIN_LENGTH && len <= BOOKING_DOMAIN_MAX_LENGTH;
}

export function isValidBookingContext(value: string): boolean {
  const len = normalizeBookingText(value).length;
  return len >= BOOKING_CONTEXT_MIN_LENGTH && len <= BOOKING_CONTEXT_MAX_LENGTH;
}
