-- Store timestamps as exact moments (timestamptz) instead of zone-less wall-clock times.
-- Run once against the fade database:
--   psql -U postgres -d fade -f fade-backend/db/migrations/002_timestamptz.sql
--
-- The existing values were written by NOW() into plain TIMESTAMP columns while the session
-- time zone was Europe/Berlin, so they are Berlin wall-clock times. USING tells Postgres
-- which zone to read them in. Check `SHOW timezone;` on any other database before running
-- this, and change the zone below if it differs, or the old rows shift by hours.

ALTER TABLE posts
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Europe/Berlin',
    ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'Europe/Berlin';

ALTER TABLE communities
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Europe/Berlin';
