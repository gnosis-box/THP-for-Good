export const FOUNDATION_ADDRESS =
  (process.env.NEXT_PUBLIC_FOUNDATION_ADDRESS ??
    '0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00') as `0x${string}`;

export const BOOKING_PRICE_CRC = Number(
  process.env.NEXT_PUBLIC_BOOKING_PRICE_CRC ?? '100',
);

export const GNOSISSCAN_TX_URL = 'https://gnosisscan.io/tx';

export const CIRCLES_PLAYGROUND_URL = 'https://circles.gnosis.io/playground';
