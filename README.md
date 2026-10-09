# fade-board

Local community boards where nothing lasts. People create boards for their neighborhood, and every post ("Spark") on a board fades away within 7 days.

> Work in progress. See [Status](#status) for what's built and what's next.

## Tech stack

| Part | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express 5, `pg` (node-postgres) |
| Database | PostgreSQL 18 with PostGIS |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) |
| Testing | Vitest, Supertest (backend API tests) |

## Features

- **Explore communities**: browse all boards, sorted by newest.
- **Create a community** from a modal, with validation errors from the backend shown in the form.
- **Location picker**: type an address in the form, press Enter (or click the search button), and pick from up to 5 results (keyboard friendly, with loading, empty and error states). The chosen place's coordinates are saved with the board, along with a short label such as "Jan de Oudeweg, Delft".
- **Board page** with its Sparks. Each Spark has an expiry time (1 to 168 hours), a live countdown that ticks every second, and a decay bar.
- **Post a Spark**: a New Spark button opens a composer with a title, details, a category and how long it lasts (1 hour, 24 hours, 3 days or 7 days).
- **Sparks fade away**: when time runs out a Spark reads "Faded", dissolves, and the cards below glide up (a plain cross-fade with reduced motion). The API only returns unexpired posts, and the backend deletes expired rows on startup and every 10 minutes.
- **Location search**: `GET /geocode` looks up an address through Nominatim and returns up to 5 matches.
- **Follows the Nominatim usage policy**: the public server forbids search-as-you-type, so the frontend only searches when the user presses Enter or the search button. The backend sends at most one request per second to Nominatim (extra requests queue, and are rejected with 429 if the wait would be too long), caches results for an hour, rate-limits each client to 20 searches a minute, and identifies the app with its own User-Agent.
- **Geographic storage**: community coordinates are stored as PostGIS `geography(Point, 4326)` values, ready for distance queries.

## Project structure

```
fade-board/
├── package.json          # root script that runs backend + frontend together
├── fade-backend/
│   ├── db/migrations/    # SQL migrations, run in order
│   └── src/
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

`002` converts the timestamp columns to `TIMESTAMPTZ`. It reads existing values as `Europe/Berlin` time; if your database already holds rows written in another time zone, check `SHOW timezone;` and change the zone in the file first.

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

`NOMINATIM_USER_AGENT` is required for location search. Nominatim's usage policy requires a
User-Agent that identifies your application (generic library defaults are not accepted). Use your
own app name, and include your app's URL or an email so they can reach you if there is a problem.
There is no default on purpose: without it, `/geocode` fails and the backend logs what is missing.

### 4. Run

From the project root:

```bash
npm run dev
```

This starts the backend on http://localhost:3000 and the frontend on http://localhost:5173. The frontend calls the backend through Vite's `/api` proxy.

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

## Status

- [x] Browse communities and board pages
- [x] Create communities
- [x] Geocoding endpoint and PostGIS storage
- [x] Location search and picker in the Create Community form
- [ ] "Nearby" search and distance sorting with PostGIS
- [x] Creating Sparks from the board page
- [x] Expired Sparks are filtered out and deleted, and fade out of the board
- [ ] User accounts, and only owners can delete their boards
- [ ] Image uploads for communities

## Attribution

Geocoding by [Nominatim](https://nominatim.org/). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## License

[MIT](LICENSE)
