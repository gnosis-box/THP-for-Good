import type { NextConfig } from "next";

import { buildContentSecurityPolicy } from "./lib/csp-umami";

// The Circles host loads miniapps inside an iframe. Default Next.js responses
// would block that with `X-Frame-Options: SAMEORIGIN`, so we explicitly allow
// the Circles host (prod + dev + any future subdomain) and Vercel preview deploys.
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
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(FRAME_ANCESTORS),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
