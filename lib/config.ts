/** THP For Good Circles group — not a valid CRC payment sink; use treasury instead. */
export const THP_GROUP_ADDRESS =
  '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00' as `0x${string}`;

/** BASE_TREASURY org for the THP group — valid pathfinder sink. */
export const THP_TREASURY_ADDRESS =
  '0xA98e85AECCfa98220aB20ce60169115C350F09b8' as `0x${string}`;

function readPublicAddress(
  envValue: string | undefined,
  fallback: `0x${string}`,
): `0x${string}` {
  const trimmed = envValue?.trim();
  return (trimmed && trimmed.length > 0 ? trimmed : fallback) as `0x${string}`;
}

/** Payment target from env; group addresses are resolved to treasury at transfer time. */
export const FOUNDATION_ADDRESS = readPublicAddress(
  process.env.NEXT_PUBLIC_FOUNDATION_ADDRESS,
  THP_TREASURY_ADDRESS,
);

export const BOOKING_PRICE_CRC = Number(
  process.env.NEXT_PUBLIC_BOOKING_PRICE_CRC?.trim() || '100',
);

export const GNOSISSCAN_TX_URL = 'https://gnosisscan.io/tx';

export const CIRCLES_PLAYGROUND_URL = 'https://circles.gnosis.io/playground';
