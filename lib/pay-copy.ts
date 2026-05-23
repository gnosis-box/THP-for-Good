/** User-facing payment and trust-estimate copy (English UI). */

export const PAY_COPY = {
  thpForGood: 'THP for Good',
  trustEstimateTitle: 'Trust path estimate (simulation)',
  trustEstimateLoading: 'Estimating trust paths…',
  trustEstimateUnavailable:
    'Trust path estimate is temporarily unavailable. Your wallet balance above is still accurate.',
  trustEstimateShortfall:
    'Your trust network may not route enough CRC for both payment legs. You can still pay — the transaction may fail.',
  paymentSplit: (expertPercent: number, treasuryPercent: number) =>
    `Payment split: ${expertPercent}% to expert, ${treasuryPercent}% to ${PAY_COPY.thpForGood}.`,
  trustLegLine: (maxCrc: string, legCrc: number, recipient: string) =>
    `~${maxCrc} CRC / ${legCrc} toward ${recipient}`,
  bookableLine: (bookableCrc: string, priceCrc: number) =>
    `~${bookableCrc} CRC max bookable at this session price (${priceCrc} CRC)`,
} as const;

export function mapPayError(err: unknown): string {
  const raw = err instanceof Error ? err.message : '';
  const msg = raw.toLowerCase();

  if (
    msg.includes('insufficient') ||
    msg.includes('balance') ||
    msg.includes('funds') ||
    msg.includes('not enough')
  ) {
    return 'Not enough CRC to complete this payment.';
  }
  if (msg.includes('user rejected') || msg.includes('denied') || msg.includes('cancel')) {
    return 'Payment cancelled.';
  }
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) {
    return 'Network error — check your connection and try again.';
  }
  if (raw) return raw;
  return 'Payment failed. Please try again.';
}
