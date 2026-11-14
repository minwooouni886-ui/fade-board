# fade-board

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
<!-- Add the CI badge here once the GitHub Actions workflow exists. -->

Local community boards where nothing lasts. People create a board for their neighborhood, and every note pinned to it comes down within 7 days.

<!-- Live demo: add the URL here once it's deployed. -->

<!-- Screenshot or GIF of a board with notes coming down goes here. -->

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Design decisions and challenges](#design-decisions-and-challenges)
- [Getting started](#getting-started)
- [How to use](#how-to-use)
- [Running tests](#running-tests)
- [API](#api)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [What I learned](#what-i-learned)
- [Credits](#credits)
- [License](#license)

## About

<!-- TODO (in your own words): why you built this. What bugged you about existing
neighborhood boards or group chats? Why should posts expire? Two or three sentences. -->

fade-board is a full-stack app built around one rule: posts don't stay. Every note gets a lifetime between 1 hour and 7 days, counts down live on the board, and is gone once it runs out, both from the screen and from the database. Boards are tied to a real place, picked through an OpenStreetMap address search and stored as geographic coordinates, so the app can later show what's happening near you.

## Features

- **Community boards**: browse all boards (newest first), each with a cover photo, its live note count and when the last note was pinned. Create one from a modal, with backend validation errors shown in the form. Board names are capped at 40 characters.
- **Board page**: a full-width header with the board's photo as its background (shaded so the text stays readable), then its notes in a timeline grouped by when they come down (coming down soon, later today, tomorrow, later this week), with small group labels that stay in view while scrolling, and a sidebar summing up the board with a map of its spot.
- **Location picker**: search for an address, choose from up to 5 results, and the board stores its coordinates plus a short label such as "Jan de Oudeweg, Delft". Keyboard friendly, with loading, empty and error states.
- **Notes**: pin a note with a title, details, a category and a lifetime of 1 hour, 24 hours, 3 days or 7 days.
- **Live countdown**: each note shows a ticking timer and a bar that shrinks as time runs out. Under 5 minutes the timer turns red and shows seconds.
- **Fade-out**: when time runs out a note reads "Faded", dissolves, and the cards below glide up. Users who prefer reduced motion get a plain cross-fade.
- **Real expiry on the server**: the API never returns expired notes, and a cleanup job deletes them.

## Tech stack

| Part | Technologies | Why |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router | <!-- TODO: your reasons --> |
| Backend | Node.js, Express 5, `pg` (node-postgres) | <!-- TODO --> |
| Database | PostgreSQL 18 with PostGIS | PostGIS stores coordinates as `geography` points and can answer "what's within X km" queries directly in SQL. |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) | Free and open, no API key needed. |
| Testing | Vitest, Supertest | Tests the Express routes over HTTP without starting a real server. |

## Design decisions and challenges

- **Expiry is enforced twice.** `GET /communities/:id/posts` filters with `expires_at > NOW()`, so an expired note is never returned even for a moment. Separately, a cleanup job deletes expired rows on startup and every 10 minutes so the table doesn't grow forever. The filter keeps the data correct, and the job keeps it small.
- **Time zones.** Timestamps were first stored as plain `TIMESTAMP`, which saves a wall-clock time with no zone, so expiry math depended on the database's time zone setting. Migration `002` switches them to `TIMESTAMPTZ`, which stores an exact moment.
- **Playing by Nominatim's rules.** The public Nominatim server forbids search-as-you-type and allows at most 1 request per second. So the frontend only searches on Enter or the search button, and the backend queues requests at 1 per second (rejecting with `429` if the wait would be too long), caches results for an hour, limits each client to 20 searches a minute, and sends an identifying User-Agent.
- **Coordinates as PostGIS geography.** Boards store a `geography(Point, 4326)` instead of two number columns, which sets up the planned "Nearby" feature without changing the schema.

## Getting started

### Requirements

- Node.js 18 or newer (uses the built-in `fetch`)
- PostgreSQL 18 with the PostGIS extension (on Windows, install PostGIS through Stack Builder)

### 1. Install dependencies

```bash
npm install
npm install --prefix fade-backend
npm install --prefix fade-frontend
```

### 2. Set up the database

Create a database called `fade`, then run the migrations in `fade-backend/db/migrations` in order:

```bash
psql -U postgres -d fade -f fade-backend/db/migrations/000_create_tables.sql
psql -U postgres -d fade -f fade-backend/db/migrations/001_add_postgis.sql
psql -U postgres -d fade -f fade-backend/db/migrations/002_timestamptz.sql
```

`002` reads existing timestamps as `Europe/Berlin` time. On an empty database this doesn't matter. If yours already holds rows written in another time zone, check `SHOW timezone;` and change the zone in the file first.

### 3. Configure the backend

Create `fade-backend/.env`:

```
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fade
NOMINATIM_USER_AGENT=fade-board/1.0 (https://github.com/your-name/fade-board)
```

`NOMINATIM_USER_AGENT` is required for location search. Nominatim's usage policy asks for a User-Agent that identifies your app, so use your own app name plus a URL or email. There is no default on purpose: without it, `/geocode` fails and the backend logs what's missing.

### 4. Run

From the project root:

```bash
npm run dev
```

This starts the backend on http://localhost:3000 and the frontend on http://localhost:5173. The frontend calls the backend through Vite's `/api` proxy.

## How to use

1. Open http://localhost:5173 and click **New board**.
2. Give the board a name, type an address in the location field, press Enter, and pick a result.
3. Open the board and click **Pin a note**. Fill in a title and details, pick a category, and choose how long it lasts.
4. Watch the countdown. Pick 1 hour to see a note come down without waiting days.

<!-- Screenshots of the create-board modal and the note composer go here. -->

## Running tests

Backend API tests use [Vitest](https://vitest.dev/) and [Supertest](https://github.com/forwardemail/supertest). The database is mocked, so no PostgreSQL setup is needed:

```bash
cd fade-backend
npm test
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/communities` | List all communities, each with `lat`/`lon` (read from its PostGIS point), plus `note_count` and `last_note_at`, both counting unexpired notes only |
| POST | `/communities` | Create a community: `name` (required), `description`, `location`, `lat`, `lon` |
| DELETE | `/communities/:id` | Delete a community |
| GET | `/communities/:id/posts` | List a community's posts that haven't expired |
| POST | `/communities/:id/posts` | Create a post: `title`, `duration_hours` (1 to 168), `description`, `category` |
| GET | `/posts/:id` | Get one post |
| DELETE | `/posts/:id` | Delete a post |
| GET | `/geocode?q=...` | Search for a place; returns up to 5 `{ name, label, lat, lon }` matches. Responds `429` when rate limited or the queue is full |

## Project structure

```
fade-board/
├── package.json          # root script that runs backend + frontend together
├── fade-backend/
│   ├── db/migrations/    # SQL migrations, run in order
│   ├── src/
│   │   ├── app.js        # Express app (exported for tests)
│   │   ├── index.js      # starts the server
│   │   ├── db.js         # PostgreSQL connection pool
│   │   ├── cleanup.js    # deletes expired posts
│   │   ├── geocode.js    # Nominatim client
│   │   └── routes/       # communities, posts, geocode
│   └── test/             # Vitest + Supertest API tests
└── fade-frontend/
    └── src/
        ├── api.ts        # all requests to the backend
        ├── pages/        # Home, Community
        └── components/
```

## Roadmap

- [ ] Seed data, so a fresh install isn't empty
- [ ] Deploy, with the live URL at the top of this README
- [ ] CI on GitHub Actions (lint, typecheck, build, tests)
- [ ] "Nearby" boards using PostGIS distance queries and browser geolocation
- [ ] Map view of nearby boards
- [ ] Live updates, so new notes appear without a reload
- [ ] User accounts, so only owners can delete their boards and notes

The full list is in [fade-frontend/TODO.md](fade-frontend/TODO.md).

## What I learned

- **Working with a third-party API I don't control.** Nominatim has a strict usage policy, so I had to design around its limits with a request queue, caching and rate limiting instead of calling it freely.
- **PostGIS migrations and functions.** I enabled PostGIS through a SQL migration and stored each board's location as a `geography(Point, 4326)`, which sets up distance queries for the planned "Nearby" feature.
- **Storing time correctly.** I first stored timestamps as plain `TIMESTAMP`, which saves a wall-clock time with no time zone, so expiry checks depended on the database's settings. I wrote a migration to switch to `TIMESTAMPTZ`, which stores an exact moment, so "expires in 1 hour" means the same thing everywhere.
- **Enforcing a rule in more than one layer.** Hiding expired posts in the frontend wasn't enough. The API filters them out in the SQL query so they're never returned, and a cleanup job deletes them so the table doesn't keep growing.
- **Using Claude skills for frontend design.** I used Claude Code's design skills to guide the visual redesign of the frontend.

## Credits

Built by [Minwoo Lee](https://github.com/minwooouni886-ui).

Geocoding by [Nominatim](https://nominatim.org/). Map data and map tiles © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

Default board photos in `fade-frontend/public/covers/` are from [Unsplash](https://unsplash.com) and used under the [Unsplash License](https://unsplash.com/license): [1](https://unsplash.com/photos/vfvze3q9rsI), [2](https://unsplash.com/photos/Y_4fVT2Do8w), [3](https://unsplash.com/photos/aIrInM9uXFc), [4](https://unsplash.com/photos/lQGecrzPFTg), [5](https://unsplash.com/photos/DPVxZH2EjoE), [6](https://unsplash.com/photos/jf-ZBxT84IM), [7](https://unsplash.com/photos/UAVXHBmVDOQ), [8](https://unsplash.com/photos/5gXPybgcM5M).

## License

[MIT](LICENSE)
