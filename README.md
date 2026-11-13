# fade-board

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
<!-- Add the CI badge here once the GitHub Actions workflow exists. -->

Local community boards where nothing lasts. People create a board for their neighborhood, and every post on it (a "Spark") fades away within 7 days.

<!-- Live demo: add the URL here once it's deployed. -->

<!-- Screenshot or GIF of a board with Sparks fading out goes here. -->

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

fade-board is a full-stack app built around one rule: posts don't stay. Every Spark gets a lifetime between 1 hour and 7 days, counts down live on the board, and is gone once it runs out, both from the screen and from the database. Boards are tied to a real place, picked through an OpenStreetMap address search and stored as geographic coordinates, so the app can later show what's happening near you.

## Features

- **Community boards**: browse all boards (newest first) and create one from a modal, with backend validation errors shown in the form.
- **Location picker**: search for an address, choose from up to 5 results, and the board stores its coordinates plus a short label such as "Jan de Oudeweg, Delft". Keyboard friendly, with loading, empty and error states.
- **Sparks**: post a Spark with a title, details, a category and a lifetime of 1 hour, 24 hours, 3 days or 7 days.
- **Live countdown**: each Spark shows a ticking timer and a decay bar. Under 5 minutes the timer turns red and shows seconds.
- **Fade-out**: when time runs out a Spark reads "Faded", dissolves, and the cards below glide up. Users who prefer reduced motion get a plain cross-fade.
- **Real expiry on the server**: the API never returns expired Sparks, and a cleanup job deletes them.

## Tech stack

| Part | Technologies | Why |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router | <!-- TODO: your reasons --> |
| Backend | Node.js, Express 5, `pg` (node-postgres) | <!-- TODO --> |
| Database | PostgreSQL 18 with PostGIS | PostGIS stores coordinates as `geography` points and can answer "what's within X km" queries directly in SQL. |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) | Free and open, no API key needed. |
| Testing | Vitest, Supertest | Tests the Express routes over HTTP without starting a real server. |

## Design decisions and challenges

- **Expiry is enforced twice.** `GET /communities/:id/posts` filters with `expires_at > NOW()`, so an expired Spark is never returned even for a moment. Separately, a cleanup job deletes expired rows on startup and every 10 minutes so the table doesn't grow forever. The filter keeps the data correct, and the job keeps it small.
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

1. Open http://localhost:5173 and click **New Community**.
2. Give the board a name, type an address in the location field, press Enter, and pick a result.
3. Open the board and click **New Spark**. Fill in a title and details, pick a category, and choose how long it lasts.
4. Watch the countdown. Pick 1 hour to see a Spark fade out without waiting days.

<!-- Screenshots of the create-board modal and the Spark composer go here. -->

## Running tests

Backend API tests use [Vitest](https://vitest.dev/) and [Supertest](https://github.com/forwardemail/supertest). The database is mocked, so no PostgreSQL setup is needed:

```bash
cd fade-backend
npm test
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/communities` | List all communities |
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
- [ ] Live updates, so new Sparks appear without a reload
- [ ] User accounts, so only owners can delete their boards and Sparks

The full list is in [fade-frontend/TODO.md](fade-frontend/TODO.md).

## What I learned

<!-- TODO (in your own words): 3 to 5 bullets. Ideas: TIMESTAMP vs TIMESTAMPTZ,
working within a third-party API's usage policy, testing Express routes with a mocked
database, PostGIS basics, building animations that respect reduced motion. -->

## Credits

Built by [Minwoo Lee](https://github.com/minwooouni886-ui).

Geocoding by [Nominatim](https://nominatim.org/). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## License

[MIT](LICENSE)
