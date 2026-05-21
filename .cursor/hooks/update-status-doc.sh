#!/usr/bin/env bash
# Regenerates docs/05-etat-projet.md after edits to app code (Cursor afterFileEdit).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
if command -v node >/dev/null 2>&1; then
  node scripts/update-status-doc.mjs --hook
fi
exit 0
