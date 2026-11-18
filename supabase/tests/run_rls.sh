#!/bin/sh
# Scratch Postgres in /tmp, Prepare Me's Supabase stub, Steadfast's real schema twice, then the two-user test. Touches no other database.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
BIN=$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)
DIR=$(mktemp -d /tmp/steadfast-rls.XXXXXX)
PORT=5545
trap '"$BIN/pg_ctl" -D "$DIR/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DIR"' EXIT
"$BIN/initdb" -D "$DIR/data" -A trust -U tester >/dev/null
"$BIN/pg_ctl" -D "$DIR/data" -o "-p $PORT -k $DIR -c listen_addresses=''" -l "$DIR/log" -w start >/dev/null
PSQL="psql -h $DIR -p $PORT -U tester -d postgres -v ON_ERROR_STOP=1 -q -At"
$PSQL -f "$HERE/stub_supabase.sql"
$PSQL -f "$HERE/../schema.sql"
$PSQL -f "$HERE/../schema.sql"
$PSQL -f "$HERE/rls_test.sql" 2>&1 | sed 's/^psql:[^:]*:[0-9]*: NOTICE:  //' | grep -v '^$'
