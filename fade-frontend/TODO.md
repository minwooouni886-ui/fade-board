# TODO

Open work, grouped into tiers. Finish the top tier before starting the next. Finished
work is listed under Done, and the README status list tracks it too.

Suggested order: seed data, deploy, CI, then Nearby with the map view. The rest can
follow in any order.

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
- **Create Sparks from the board page.** A New Spark button opens a composer (title,
  details, category, and a fade time of 1 hour to 7 days). The panel grows out of the
  button, backend errors show in the form, and the feed refreshes after posting.
- **Expiry on the server.** `GET /communities/:id/posts` filters with `expires_at > NOW()`,
  and a cleanup job deletes expired rows on startup and every 10 minutes. Timestamps are
  now `TIMESTAMPTZ` (migration `002`).
- **Live countdown and fade animation.** Labels tick every second and change format as
  time runs down (`Xd Yh`, `Xh Ym`, `Xm`, then `Xm Ys` in red under 5 minutes). An expired
  Spark reads "Faded" for a moment, dissolves, and the cards below glide up. Reduced
  motion gets a plain cross-fade.

## Tier 1: Core features and a live site

1. **Seed data.** A script that inserts a handful of boards with locations and a few
   Sparks with different expiry times, so a fresh install, the live site and any
   screenshots are not empty.
2. **Deploy.** Frontend on Vercel or Netlify, backend and Postgres with PostGIS
   on Render, Fly.io, or Railway. Run the migrations on the host, and put the live URL
   at the top of the README. Before going live, add `app.set('trust proxy', 1)` in
   `app.js` (production only), so the `/geocode` rate limiter sees each visitor's real
   IP instead of the host's proxy and doesn't count everyone as one client. Also set
   `NOMINATIM_USER_AGENT` on the host. Migration `002` reads the old timestamps as
   `Europe/Berlin`, which is right for the local database; on a fresh host with no rows it
   changes nothing, but check `SHOW timezone;` before running it on a database with data.
3. **CI.** A GitHub Actions workflow that runs lint, typecheck, build, and the
   backend tests on every push. Add the status badge to the README.

## Tier 2: Location and live features

4. **"Nearby" with PostGIS.** The coordinates are already stored. Add a GiST index
   on `geom`, a query using `ST_DWithin` and `ST_Distance`, and a `?lat=&lon=&radius=`
   filter on `GET /communities`. Use browser geolocation on the frontend, and bring
   back the "Nearest" sort in `Home.tsx` (commented out right now).
5. **Map view.** Show nearby boards on a Leaflet or MapLibre map with OpenStreetMap
   tiles (with the OpenStreetMap attribution). Take a screenshot of it for the README.
6. **Live updates.** Push new Sparks to open boards with Server-Sent Events or
   WebSockets, so a Spark posted by someone else appears without a reload. (The "time left"
   labels already tick.)
7. **Real type-ahead for locations.** The picker searches on Enter because the public
   Nominatim server forbids autocomplete. Switch to a geocoder built for it (Photon,
   Geoapify, MapTiler) and map its response to the same `{ name, label, lat, lon }` shape.

## Tier 3: Quality and tooling

8. **Real-database tests.** The current backend tests mock the database. Add an
    integration suite against a real Postgres with PostGIS (a CI service container
    or Testcontainers) that covers the migrations, the expiry filter, the cleanup
    job, and the distance query. Run it in CI.
9. **More tests.** Backend tests for `/geocode` (the queue, cache, rate limit and
    `buildLabel`), the expiry filter on `GET /communities/:id/posts`, and
    `deleteExpiredPosts`. Frontend tests with Vitest and React Testing Library for the card,
    modal and location picker logic (validation, error display, the time-left labels), plus
    one Playwright test of the create-board and post-a-Spark flow.
10. **Input validation and hardening.** Schema validation on request bodies (zod),
    rate limiting on the write endpoints, and proper 404 and error handling on every
    route, with one consistent error format.
11. **One-command setup.** A `docker-compose.yml` with Postgres and PostGIS plus
    the migrations and seed data, so the project runs without installing PostGIS.
12. **API docs.** An OpenAPI spec served at `/docs`, replacing the README table.
13. **README improvements.** Screenshots or a short demo GIF at the top, an
    architecture diagram, and a "decisions" section (why PostGIS, why expiry is
    enforced in the query and in a job, why Nominatim needs a queue and a cache).

## Tier 4: Accounts and polish

14. **User accounts.** Sign-up and login (JWT or sessions), post authorship shown on
    Spark cards, and only owners can delete their boards and Sparks. Do this after
    the tiers above, since it touches every route.
15. **Dark mode.** Move the color tokens in `tailwind.config.js` to CSS variables
    with a light and a dark set, follow `prefers-color-scheme`, and add a toggle.
16. **Accessibility pass.** Focus trap in the modal, keyboard navigation for the
    cards, and a Lighthouse score in the README.
