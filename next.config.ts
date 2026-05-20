import type { NextConfig } from 'next';

const frameOriginEnv = process.env.NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN;

const FRAME_ANCESTORS = [
  "'self'",
  'https://*.gnosis.io',
  'https://*.vercel.app',
  ...(frameOriginEnv ? [frameOriginEnv] : []),
].join(' ');

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${FRAME_ANCESTORS};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
