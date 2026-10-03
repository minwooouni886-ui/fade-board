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

## Features

- **Explore communities**: browse all boards, sorted by newest.
- **Create a community** from a modal, with validation errors from the backend shown in the form.
- **Board page** with its Sparks. Each Spark has an expiry time (1 to 168 hours) and a countdown bar, and is hidden once it has expired.
- **Location search**: `GET /geocode` looks up an address through Nominatim and returns up to 5 matches.
- **Geographic storage**: community coordinates are stored as PostGIS `geography(Point, 4326)` values, ready for distance queries.

## Project structure

```
fade-board/
├── package.json          # root script that runs backend + frontend together
├── fade-backend/
│   ├── db/migrations/    # SQL migrations, run in order
│   └── src/
│       ├── index.js      # Express app
│       ├── db.js         # PostgreSQL connection pool
│       ├── geocode.js    # Nominatim client
│       └── routes/       # communities, posts, geocode
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
psql -U postgres -d fade -f fade-backend/db/migrations/001_add_postgis.sql
```

### 3. Configure the backend

Create `fade-backend/.env`:

```
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fade
```

### 4. Run

From the project root:

```bash
npm run dev
```

This starts the backend on http://localhost:3000 and the frontend on http://localhost:5173. The frontend calls the backend through Vite's `/api` proxy.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/communities` | List all communities |
| POST | `/communities` | Create a community: `name` (required), `description`, `location`, `lat`, `lon` |
| DELETE | `/communities/:id` | Delete a community |
| GET | `/communities/:id/posts` | List a community's posts |
| POST | `/communities/:id/posts` | Create a post: `title`, `duration_hours` (1 to 168), `description`, `category` |
| GET | `/posts/:id` | Get one post |
| DELETE | `/posts/:id` | Delete a post |
| GET | `/geocode?q=...` | Search for a place; returns up to 5 `{ name, lat, lon }` matches |

## Status

- [x] Browse communities and board pages
- [x] Create communities
- [x] Geocoding endpoint and PostGIS storage
- [ ] Location search and picker in the Create Community form
- [ ] "Nearby" search and distance sorting with PostGIS
- [ ] Creating Sparks from the board page
- [ ] User accounts, and only owners can delete their boards
- [ ] Image uploads for communities

## Attribution

Geocoding by [Nominatim](https://nominatim.org/). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## License

[MIT](LICENSE)
