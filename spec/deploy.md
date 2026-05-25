# Deploy (Coolify)

- Build: `Dockerfile` with Next.js `output: 'standalone'` (**Node 22 Alpine**, pnpm via `packageManager` in `package.json`).
- **Start command (critical):** use `node server.js` after repair + seed — **not** `next start`. With `output: 'standalone'`, `next start` serves the wrong bundle and causes `Failed to find Server Action` errors after deploys. The Dockerfile `CMD` and `pnpm start` both run `tsx scripts/repair-db-fk.ts && tsx scripts/seed.ts && node server.js`. Do **not** override Coolify start command to `next start`.
- **Persist SQLite:** mount host volume to `/app/data` (DB path `data/thp.db` under app root).
- **Coolify env vars:** set `NODE_ENV=production` as **Runtime only** (not buildtime). Buildtime `NODE_ENV=production` skips devDependencies and can break `pnpm build`. `NEXT_PUBLIC_*` vars must stay buildtime.
- **Healthcheck (Dockerfile apps):** the runner image includes `curl` + a `HEALTHCHECK` on `http://127.0.0.1:3000/`. On Coolify, either disable the platform healthcheck (like dev/staging) or keep it enabled after `curl` is in the image — Alpine has no `curl` by default, which causes false `unhealthy` rollbacks even when Next.js is ready.
- Env: `ADMIN_ADDRESSES`, Cal.com keys per [`lib/calcom.ts`](../lib/calcom.ts).
- CSP `frame-ancestors` is set in [`next.config.ts`](../next.config.ts) for the Circles iframe; `frame-src` allows Google Calendar embed only (Umami is proxied via `GET /api/stats`, not iframe).

## SQLite backup (before manual DB repair)

Identify the container (example: staging):

```bash
docker ps --filter label=coolify.projectName=thp-for-good \
  --format '{{.Names}} {{.Label "caddy_0"}} {{.Label "coolify.environmentName"}}'
```

WAL-safe snapshot (same approach as [`scripts/cpdb`](../scripts/cpdb)):

```bash
CN=<container_name>
TS=$(date +%Y%m%d_%H%M%S)
mkdir -p /root/thp-db-snapshots
TMP=/tmp/thp_${TS}.db
docker cp "$CN:/app/data/thp.db" "$TMP"
docker cp "$CN:/app/data/thp.db-wal" "${TMP}-wal" 2>/dev/null || true
docker cp "$CN:/app/data/thp.db-shm" "${TMP}-shm" 2>/dev/null || true
sqlite3 "$TMP" ".backup /root/thp-db-snapshots/pre_repair_${TS}.db"
rm -f "$TMP" "${TMP}-wal" "${TMP}-shm"
sqlite3 /root/thp-db-snapshots/pre_repair_${TS}.db "PRAGMA foreign_key_list(bookings);"
```

Prod snapshots: run `cpdb` on the server — it always writes `prod_*.db` under `/root/thp-db-snapshots/`.

## SQLite FK repair (mentors → experts split)

Symptom: `POST /api/bookings` returns **503** / `DB_MIGRATION_FK` for newly registered experts while `GET /api/experts/:id` works. Cause: legacy `bookings` FK still targets `mentors(id)` after the expert rename migration.

Dry-run inside the running container:

```bash
docker exec "$CN" node node_modules/tsx/dist/cli.mjs scripts/repair-db-fk.ts --dry-run
```

Apply repair (also runs automatically on container start):

```bash
docker exec "$CN" node node_modules/tsx/dist/cli.mjs scripts/repair-db-fk.ts
docker restart "$CN"
```

Local simulation of the legacy bug + fix:

```bash
pnpm simulate-legacy-db
```

Verify on staging after repair:

```bash
curl -s -w '\nHTTP:%{http_code}\n' https://staging.thp.gnosis.box/api/bookings \
  -H 'content-type: application/json' \
  --data '{"expert_id":12,"booker_address":"0x…","tx_hash":"0x…","slot_time":"…","attendee_email":"…","attendee_name":"…"}'
```

Recover a paid booking when the tx is already on-chain: replay the same `POST /api/bookings` payload (idempotent on `tx_hash`).

## Rollback

```bash
docker cp /root/thp-db-snapshots/pre_repair_${TS}.db "$CN:/app/data/thp.db"
docker exec "$CN" rm -f /app/data/thp.db-wal /app/data/thp.db-shm
docker restart "$CN"
```

Do not restore a prod backup onto staging without checking `PRAGMA foreign_key_list(bookings)`.
