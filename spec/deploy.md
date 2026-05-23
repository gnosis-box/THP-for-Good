# Deploy (Coolify)

- Build: `Dockerfile` with Next.js `output: 'standalone'` (**Node 22 Alpine**, pnpm via `packageManager` in `package.json`).
- **Persist SQLite:** mount host volume to `/app/data` (DB path `data/thp.db` under app root).
- Env: `ADMIN_ADDRESSES`, Cal.com keys per [`lib/calcom.ts`](../lib/calcom.ts).
- CSP `frame-ancestors` is set in [`next.config.ts`](../next.config.ts) for the Circles iframe; `frame-src` allows Google Calendar embed only (Umami is proxied via `GET /api/stats`, not iframe).
