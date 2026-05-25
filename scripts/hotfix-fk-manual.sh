#!/usr/bin/env bash
# hotfix-fk-manual.sh — one-shot SQLite repair for mentors/experts FK split
# Run on the Coolify host with the target container name.
set -euo pipefail

CN="${1:-}"
if [[ -z "$CN" ]]; then
  echo "Usage: $0 <container_name>" >&2
  exit 1
fi

TS=$(date +%Y%m%d_%H%M%S)
SNAP_DIR="${SNAP_DIR:-/root/thp-db-snapshots}"
DB_PATH="/app/data/thp.db"
mkdir -p "$SNAP_DIR"

TMP="/tmp/thp_hotfix_${TS}.db"
echo "Snapshotting $CN → $SNAP_DIR/staging_pre_fk_fix_${TS}.db"
docker cp "$CN:$DB_PATH" "$TMP"
docker cp "$CN:${DB_PATH}-wal" "${TMP}-wal" 2>/dev/null || true
docker cp "$CN:${DB_PATH}-shm" "${TMP}-shm" 2>/dev/null || true
sqlite3 "$TMP" ".backup $SNAP_DIR/staging_pre_fk_fix_${TS}.db"
rm -f "$TMP" "${TMP}-wal" "${TMP}-shm"

echo "FK before repair:"
sqlite3 "$SNAP_DIR/staging_pre_fk_fix_${TS}.db" "PRAGMA foreign_key_list(bookings);"

echo "Running repair-db-fk inside container..."
docker exec "$CN" node node_modules/tsx/dist/cli.mjs scripts/repair-db-fk.ts

echo "Restarting container..."
docker restart "$CN"

echo "Done. Backup: $SNAP_DIR/staging_pre_fk_fix_${TS}.db"
