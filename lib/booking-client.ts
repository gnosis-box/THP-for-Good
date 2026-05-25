export type BookingPostPayload = {
  expert_id: number;
  booker_address: string;
  tx_hash?: string;
  slot_time?: string;
  attendee_email?: string;
  attendee_name?: string;
};

export type BookingPostResult = {
  id: number;
  cal_booking_uid?: string | null;
  calendar_event_url?: string | null;
};

type BookingErrorBody = {
  error?: string;
  code?: string;
  tx_hash?: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number, body: BookingErrorBody | null): boolean {
  if (status === 503) return true;
  if (status === 409 && body?.code === 'DB_MIGRATION_FK') return true;
  return false;
}

export async function postBookingWithRetry(
  payload: BookingPostPayload,
  options: { attempts?: number; delaysMs?: number[] } = {},
): Promise<BookingPostResult> {
  const attempts = options.attempts ?? 3;
  const delaysMs = options.delaysMs ?? [1000, 3000, 10000];

  let lastError = 'Payment succeeded but booking could not be saved. Check My Calls or contact support.';
  let lastTxHash = payload.tx_hash;

  for (let i = 0; i < attempts; i++) {
    const bookingRes = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (bookingRes.ok) {
      return (await bookingRes.json()) as BookingPostResult;
    }

    const detail = (await bookingRes.json().catch(() => null)) as BookingErrorBody | null;
    lastError = detail?.error ?? lastError;
    if (detail?.tx_hash) lastTxHash = detail.tx_hash;

    if (!isRetryableStatus(bookingRes.status, detail) || i === attempts - 1) {
      if (lastTxHash) {
        throw new Error(
          `${lastError} On-chain tx: ${lastTxHash.slice(0, 10)}…${lastTxHash.slice(-8)} — retry from My Calls or contact support.`,
        );
      }
      throw new Error(lastError);
    }

    await sleep(delaysMs[i] ?? delaysMs[delaysMs.length - 1] ?? 3000);
  }

  throw new Error(lastError);
}
