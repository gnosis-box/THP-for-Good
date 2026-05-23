# Deploy (Coolify)

- Build: `Dockerfile` with Next.js `output: 'standalone'` (**Node 22 Alpine**, pnpm via `packageManager` in `package.json`).
- **Start command (critical):** use `node server.js` after seed — **not** `next start`. With `output: 'standalone'`, `next start` serves the wrong bundle and causes `Failed to find Server Action` errors after deploys. The Dockerfile `CMD` and `pnpm start` both run `tsx scripts/seed.ts && node server.js`. Do **not** override Coolify start command to `next start`.
- **Persist SQLite:** mount host volume to `/app/data` (DB path `data/thp.db` under app root).
- **Coolify env vars:** set `NODE_ENV=production` as **Runtime only** (not buildtime). Buildtime `NODE_ENV=production` skips devDependencies and can break `pnpm build`. `NEXT_PUBLIC_*` vars must stay buildtime.
- Env: `ADMIN_ADDRESSES`, Cal.com keys per [`lib/calcom.ts`](../lib/calcom.ts).
- CSP `frame-ancestors` is set in [`next.config.ts`](../next.config.ts) for the Circles iframe; `frame-src` allows Google Calendar embed only (Umami is proxied via `GET /api/stats`, not iframe).
