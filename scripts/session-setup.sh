#!/usr/bin/env bash
# SessionStart hook: get a fresh Claude Code / dev session ready to run.
# Idempotent and fast on warm checkouts (skips install when node_modules exists).
# Always exits 0 so a hiccup never blocks the session from starting.

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

install_if_needed() {
  local app="$1"
  local dir="$ROOT/apps/$app"
  [ -d "$dir" ] || return 0
  if [ -d "$dir/node_modules" ]; then
    echo "• apps/$app: deps present"
    return 0
  fi
  echo "• apps/$app: installing deps…"
  ( cd "$dir" && npm install --no-fund --no-audit >/dev/null 2>&1 ) \
    && echo "  apps/$app: ready" \
    || echo "  apps/$app: npm install failed — run it manually"
}

echo "── Unö session setup ───────────────────────────────"
command -v node >/dev/null 2>&1 && echo "• node $(node -v)" || echo "• node: NOT FOUND (need Node 22)"
install_if_needed api
install_if_needed mobile

# Seed apps/api/.env from the example if it's missing (never overwrite).
if [ -f "$ROOT/apps/api/.env.example" ] && [ ! -f "$ROOT/apps/api/.env" ]; then
  cp "$ROOT/apps/api/.env.example" "$ROOT/apps/api/.env"
  echo "• apps/api/.env created from .env.example"
fi

echo "Next: start the DB (docker compose up -d db  OR  bash scripts/dev-db.sh),"
echo "      then 'npm run api' and 'npm run mobile' from the repo root."
echo "────────────────────────────────────────────────────"
exit 0
