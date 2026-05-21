/** THP For Good Circles group — not a valid CRC payment sink; resolved to treasury at transfer time. */
export const THP_GROUP_ADDRESS =
  "0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00" as `0x${string}`;

/** BASE_TREASURY org for the THP group — valid pathfinder sink. */
export const THP_TREASURY_ADDRESS =
  "0xA98e85AECCfa98220aB20ce60169115C350F09b8" as `0x${string}`;

function readPublicAddress(
  envValue: string | undefined,
  fallback: `0x${string}`,
): `0x${string}` {
  const trimmed = envValue?.trim();
  return (trimmed && trimmed.length > 0 ? trimmed : fallback) as `0x${string}`;
}

/** Payment target; group addresses are resolved to treasury before transfer. */
export const FOUNDATION_ADDRESS = readPublicAddress(
  process.env.NEXT_PUBLIC_FOUNDATION_ADDRESS,
  THP_GROUP_ADDRESS,
);

export const BOOKING_PRICE_CRC = Number(
  process.env.NEXT_PUBLIC_BOOKING_PRICE_CRC?.trim() || "100",
);

export function isFoundationConfigured(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(FOUNDATION_ADDRESS);
}
