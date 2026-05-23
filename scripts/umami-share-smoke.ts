#!/usr/bin/env tsx
/**
 * Smoke test: Umami share API → stats summary (same path as GET /api/stats webAnalytics).
 * Usage: pnpm tsx scripts/umami-share-smoke.ts
 */
import { fetchWebAnalytics } from '../lib/umami-share-client';

async function main() {
  const data = await fetchWebAnalytics(30);
  if (!data.available) {
    console.error('FAIL: webAnalytics unavailable');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
  console.log('OK: Umami share API');
  console.log(
    JSON.stringify(
      {
        visitors: data.visitors,
        visits: data.visits,
        pageviews: data.pageviews,
        bounceRate: data.bounceRate,
        avgVisitSeconds: data.avgVisitSeconds,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
