import type { NextConfig } from 'next';

const frameOriginEnv = process.env.NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN;

const FRAME_ANCESTORS = [
  "'self'",
  "https://*.gnosis.io",
  "https://*.gnosis.box",
  "https://*.vercel.app",
].join(" ");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ['better-sqlite3'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${FRAME_ANCESTORS}; frame-src https://calendar.google.com;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
