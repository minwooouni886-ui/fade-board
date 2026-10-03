-- Enable PostGIS and store community locations as geographic points.
-- Run once against the fade database:
--   psql -U postgres -d fade -f fade-backend/db/migrations/001_add_postgis.sql

CREATE EXTENSION IF NOT EXISTS postgis;

-- Coordinates of the place picked from the geocode search (longitude, latitude).
-- NULL when a community has no location.
ALTER TABLE communities ADD COLUMN IF NOT EXISTS geom geography(Point, 4326);

-- Was VARCHAR(10), too short for Nominatim place names.
ALTER TABLE communities ALTER COLUMN location TYPE TEXT;
