import type { Booking, BookingsStore } from '@/lib/types';

const STORAGE_KEY = 'thp-bookings-v1';

function readStore(): BookingsStore {
  if (typeof window === 'undefined') return { bookings: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bookings: [] };
    return JSON.parse(raw) as BookingsStore;
  } catch {
    return { bookings: [] };
  }
}

function writeStore(store: BookingsStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getBookings(): Booking[] {
  return readStore().bookings;
}

export function getBookingsForAddress(address: string): Booking[] {
  const lower = address.toLowerCase();
  return getBookings().filter(
    (booking) => booking.studentAddress.toLowerCase() === lower,
  );
}

export function isSlotBooked(mentorId: string, slotId: string): boolean {
  return getBookings().some(
    (booking) => booking.mentorId === mentorId && booking.slotId === slotId,
  );
}

export function addBooking(booking: Booking): void {
  const store = readStore();
  store.bookings.unshift(booking);
  writeStore(store);
}

export function markBookingCompleted(bookingId: string): void {
  const store = readStore();
  store.bookings = store.bookings.map((booking) =>
    booking.id === bookingId ? { ...booking, status: 'completed' } : booking,
  );
  writeStore(store);
}
