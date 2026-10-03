-- Base schema: the communities and posts tables.
-- Run first, against an empty fade database:
--   psql -U postgres -d fade -f fade-backend/db/migrations/000_create_tables.sql

CREATE TABLE IF NOT EXISTS communities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    location    VARCHAR(10),  -- widened to TEXT in 001
    created_at  TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL PRIMARY KEY,
    -- Deleting a community also deletes its posts
    community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    category     TEXT,
    created_at   TIMESTAMP DEFAULT now(),
    expires_at   TIMESTAMP NOT NULL
);
