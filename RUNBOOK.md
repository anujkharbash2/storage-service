# Storage Service — Backup & Restore Runbook

## Backup
Run `node src/backup.js` (uses Postgres 17 client tools via `/opt/homebrew/opt/postgresql@17/bin/pg_dump`).
Creates a timestamped SQL dump in `/backups`. Not yet automated on a schedule — manual for now.

## Restore procedure (tested 2026-07-04)
1. `createdb <restore-target>`
2. `psql <restore-target> < backups/<file>.sql`
3. Verify: `psql <restore-target> -c "\dt"` and spot-check row counts
Result: all 4 application tables (accounts, api_keys, extraction_results, usage_events) restored correctly with matching data. Supabase-internal schema noise (vault, auth extensions) is expected and harmless in a local restore target.

## Backup tier status
Currently on Supabase **free tier** — no automated/managed backups included. 
Our own `backup.js` script is the only backup mechanism right now.
This is a real gap flagged for Team 8/founders: production launch should not 
proceed on free tier without either (a) upgrading to a paid tier with automated 
backups, or (b) a scheduled, monitored version of our own backup script with 
offsite storage — not just a laptop.

## Encryption at rest
Supabase encrypts both the Postgres database and Storage buckets at rest by default 
(AES-256, managed by the underlying cloud provider). No additional action required 
on our end — verified via Supabase's security documentation.