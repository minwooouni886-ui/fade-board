# TODO

Open work, grouped into tiers. Finish the top tier before starting the next. Finished
work is listed under Done, and the README status list tracks it too.

## Done

- **Browse communities and board pages**, with Sparks that show a countdown and hide
  once expired.
- **Create communities** from a modal, with backend validation errors shown in the form.
- **Geocoding endpoint and PostGIS storage.** `GET /geocode` returns up to 5 matches,
  and community coordinates are stored as `geography(Point, 4326)`.
- **Location picker in the Create Community form.** Searches on Enter or the search
  button, not while typing, because Nominatim forbids autocomplete. The chosen place's
  coordinates and a short label ("Jan de Oudeweg, Delft") are saved with the board.
- **Nominatim usage policy handling.** Queue limited to 1 request per second (429 when
  the wait is too long), a one-hour cache, a per-IP rate limit on `/geocode`, and a
  required `NOMINATIM_USER_AGENT`.
- **Backend API tests** with Vitest and Supertest (database mocked).
- **Apple-style light theme** and the redesigned modal.

## Tier 1: Core features

1. **Create Sparks from the board page.** The backend endpoint exists
   (`POST /communities/:id/posts`, `title` and `duration_hours` 1 to 168 required).
   Add `createPost` to `api.ts`, a composer (title, description, category, duration
   picker), and show the backend's 400 errors in the form.
2. **Make expiry real on the server.** `GET /communities/:id/posts` returns every
   post and the frontend hides expired ones. Filter with `expires_at > NOW()` in
   the query, then add a cleanup job that deletes expired rows (a scheduled
   `DELETE`, or `pg_cron`). Test both.
3. **Deploy.** Frontend on Vercel or Netlify, backend and Postgres with PostGIS
   on Render, Fly.io, or Railway. Put the live URL at the top of the README.
   Before going live, add `app.set('trust proxy', 1)` in `app.js` (production only),
   so the `/geocode` rate limiter sees each visitor's real IP instead of the host's
   proxy and doesn't count everyone as one client. Also set `NOMINATIM_USER_AGENT`
   on the host.

## Tier 2: Location and live features

4. **"Nearby" with PostGIS.** The coordinates are already stored. Add a GiST index
   on `geom`, a query using `ST_DWithin` and `ST_Distance`, and a `?lat=&lon=&radius=`
   filter on `GET /communities`. Use browser geolocation on the frontend, and bring
   back the "Nearest" sort in `Home.tsx` (commented out right now).
5. **Map view.** Show nearby boards on a Leaflet or MapLibre map with OpenStreetMap
   tiles.
6. **Live updates.** Push new Sparks to open boards with Server-Sent Events or
   WebSockets, and tick the "time left" labels so they stop going stale.
7. **Real type-ahead for locations.** The picker searches on Enter because the public
   Nominatim server forbids autocomplete. Switch to a geocoder built for it (Photon,
   Geoapify, MapTiler) and map its response to the same `{ name, label, lat, lon }` shape.

## Tier 3: Quality and tooling

8. **CI.** A GitHub Actions workflow that runs lint, typecheck, build, and the
   backend tests on every push. Add the status badge to the README.
9. **Real-database tests.** The current backend tests mock the database. Add an
   integration suite against a real Postgres with PostGIS (a CI service container
   or Testcontainers) that covers the migrations, the expiry filter, and the
   distance query.
10. **More tests.** Backend tests for `/geocode` (the queue, cache, rate limit and
    `buildLabel`). Frontend tests with Vitest and React Testing Library for the card,
    modal and location picker logic (validation, error display, expiry labels), plus
    one Playwright test of the create-board and post-a-Spark flow.
11. **Input validation and hardening.** Schema validation on request bodies (zod),
    rate limiting on the write endpoints, and proper 404 and error handling on every
    route.
12. **One-command setup.** A `docker-compose.yml` with Postgres and PostGIS plus
    the migrations, so the project runs without installing PostGIS.
13. **API docs.** An OpenAPI spec served at `/docs`, replacing the README table.

## Tier 4: Accounts and polish

14. **User accounts.** Sign-up and login (JWT or sessions), post authorship shown on
    Spark cards, and only owners can delete their boards and Sparks. Do this after
    the tiers above, since it touches every route.
15. **Dark mode.** Move the color tokens in `tailwind.config.js` to CSS variables
    with a light and a dark set, follow `prefers-color-scheme`, and add a toggle.
16. **README improvements.** Screenshots or a short demo GIF at the top, an
    architecture diagram, and a "decisions" section (why PostGIS, why expiry is
    enforced in the query and in a job, why Nominatim).
17. **Accessibility pass.** Focus trap in the modal, keyboard navigation for the
    cards, and a Lighthouse score in the README.
