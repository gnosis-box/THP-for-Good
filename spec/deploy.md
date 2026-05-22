# Deploy (Coolify)

- Build: `Dockerfile` with Next.js `output: 'standalone'`.
- **Persist SQLite:** mount host volume to `/app/data` (DB path `data/thp.db` under app root).
- Env: `ADMIN_ADDRESSES`, Cal.com keys per [`lib/calcom.ts`](../lib/calcom.ts).
- CSP `frame-ancestors` / `frame-src` are set in [`next.config.ts`](../next.config.ts) for Circles iframe + Google Calendar embed.
