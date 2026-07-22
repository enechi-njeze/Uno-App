#!/usr/bin/env bash
# Start a local Postgres for development WITHOUT Docker — for container/web
# sessions where the Docker daemon isn't running. Prefer `docker compose up -d db`
# on a normal machine; this is the fallback.
#
# Starts Postgres 16 on port 5433 and creates the `uno` database. Postgres
# refuses to run as root, so the cluster is owned by an unprivileged user.
# After it's up, point apps/api/.env at it:
#   DATABASE_URL=postgresql://postgres@127.0.0.1:5433/uno
set -euo pipefail

PORT="${UNO_DB_PORT:-5433}"
PGUSER_NAME="pguser"
PGDATA="/home/${PGUSER_NAME}/uno-pgdata"

PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
if [ -z "${PGBIN}" ]; then
  echo "Postgres server binaries not found under /usr/lib/postgresql/*/bin." >&2
  echo "Install postgresql, or use Docker: docker compose up -d db" >&2
  exit 1
fi
export PATH="${PGBIN}:${PATH}"

# Ensure the unprivileged owner exists (needs root; sessions run as root).
if ! id "${PGUSER_NAME}" >/dev/null 2>&1; then
  useradd -m "${PGUSER_NAME}"
fi

as_pg() { su "${PGUSER_NAME}" -c "$1"; }

if [ ! -d "${PGDATA}/base" ]; then
  echo "• initializing cluster at ${PGDATA}"
  as_pg "${PGBIN}/initdb -D '${PGDATA}' -U postgres --auth=trust" >/dev/null
fi

if as_pg "${PGBIN}/pg_ctl -D '${PGDATA}' status" >/dev/null 2>&1; then
  echo "• Postgres already running"
else
  echo "• starting Postgres on port ${PORT}"
  as_pg "${PGBIN}/pg_ctl -D '${PGDATA}' -o '-p ${PORT} -k /tmp' -l /tmp/uno-pg.log start"
  sleep 2
fi

# Create the database if absent.
if ! psql -h /tmp -p "${PORT}" -U postgres -tAc \
      "SELECT 1 FROM pg_database WHERE datname='uno'" | grep -q 1; then
  psql -h /tmp -p "${PORT}" -U postgres -c "CREATE DATABASE uno;" >/dev/null
  echo "• created database 'uno'"
fi

echo "Postgres ready:  postgresql://postgres@127.0.0.1:${PORT}/uno"
echo "Set that as DATABASE_URL in apps/api/.env"
