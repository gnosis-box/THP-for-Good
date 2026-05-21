import type { BookedCall } from "@/lib/mentors";

const STORAGE_PREFIX = "thp-mentor-bookings:";

function storageKey(walletAddress: string): string {
  return `${STORAGE_PREFIX}${walletAddress.toLowerCase()}`;
}

export function getBookings(walletAddress: string | null): BookedCall[] {
  if (!walletAddress || typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(walletAddress));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BookedCall[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addBooking(
  walletAddress: string,
  booking: Omit<BookedCall, "id" | "bookedAt"> & { bookedAt?: string },
): BookedCall[] {
  const entry: BookedCall = {
    ...booking,
    id: `${Date.now()}-${booking.mentorSlug}`,
    bookedAt: booking.bookedAt ?? new Date().toISOString(),
  };
  const existing = getBookings(walletAddress);
  const next = [entry, ...existing];
  localStorage.setItem(storageKey(walletAddress), JSON.stringify(next));
  return next;
}
