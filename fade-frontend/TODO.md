# TODO

Ordered by how much each item shows off to someone reviewing the repo. Finish the
top tier before starting the next. Done work is tracked in the README status list.

## Tier 1: make it a real, working product

1. **Create Sparks from the board page.** The backend endpoint exists
   (`POST /communities/:id/posts`, `title` and `duration_hours` 1 to 168 required).
   Add `createPost` to `api.ts`, a composer (title, description, category, duration
   picker), and show the backend's 400 errors in the form. Without this the app
   can't post, which is the whole point of it.
2. **Make expiry real on the server.** `GET /communities/:id/posts` returns every
   post and the frontend hides expired ones. Filter with `expires_at > NOW()` in
   the query, then add a cleanup job that deletes expired rows (a scheduled
   `DELETE`, or `pg_cron`). Test both. Right now "posts fade away" is only true
   in the UI.
3. **Deploy it.** Frontend on Vercel or Netlify, backend and Postgres with PostGIS
   on Render, Fly.io, or Railway. Put the live URL at the top of the README. A
   running link beats any other line on the page. Before going live, add
   `app.set('trust proxy', 1)` in `app.js` (production only), so the `/geocode`
   rate limiter sees each visitor's real IP instead of the host's proxy and
   doesn't count everyone as one client.

## Tier 2: the features that make it technically interesting

4. **"Nearby" with PostGIS.** The coordinates are already stored. Add a GiST index
   on `geom`, a query using `ST_DWithin` and `ST_Distance`, and a `?lat=&lon=&radius=`
   filter on `GET /communities`. Use browser geolocation on the frontend, and bring
   back the "Nearest" sort in `Home.tsx` (commented out right now).
5. **Location picker in the Create Community form.** Wire the existing
   `/geocode` endpoint into a debounced search box with a suggestion list, and send
   `lat` and `lon` with the form. Right now the modal sends only free text.
6. **Map view.** Show nearby boards on a Leaflet or MapLibre map with OpenStreetMap
   tiles. It is the most visual thing you can add, and it makes the PostGIS work
   visible in a screenshot.
7. **Live updates.** Push new Sparks to open boards with Server-Sent Events or
   WebSockets, and tick the "time left" labels so they stop going stale. Good talking
   point about connection handling and trade-offs.

## Tier 3: engineering quality recruiters look for

8. **CI.** A GitHub Actions workflow that runs lint, typecheck, build, and the
   backend tests on every push. Add the status badge to the README.
9. **Real-database tests.** The current backend tests mock the database. Add an
   integration suite against a real Postgres with PostGIS (a CI service container
   or Testcontainers) that covers the migrations, the expiry filter, and the
   distance query.
10. **Frontend tests.** Vitest and React Testing Library for the card and modal
    logic (validation, error display, expiry labels), plus one Playwright test of
    the create-board and post-a-Spark flow.
11. **Input validation and hardening.** Schema validation on request bodies (zod),
    rate limiting on the write endpoints and `/geocode` (Nominatim has a usage
    policy), a Nominatim cache, and proper 404 and error handling on every route.
12. **One-command setup.** A `docker-compose.yml` with Postgres and PostGIS plus
    the migrations, so anyone can run the project without installing PostGIS.
13. **API docs.** An OpenAPI spec served at `/docs`, replacing the README table.

## Tier 4: accounts and polish

14. **User accounts.** Sign-up and login (JWT or sessions), post authorship shown on
    Spark cards, and only owners can delete their boards and Sparks. Do this after
    the tiers above, since it touches every route.
15. **Dark mode.** Move the color tokens in `tailwind.config.js` to CSS variables
    with a light and a dark set, follow `prefers-color-scheme`, and add a toggle.
16. **README that sells it.** A short demo GIF or screenshots at the top, an
    architecture diagram, and a "decisions" section (why PostGIS, why expiry is
    enforced in the query and in a job, why Nominatim). Being able to explain the
    choices is worth more than the feature list.
17. **Accessibility pass.** Focus trap in the modal, keyboard navigation for the
    cards, and a Lighthouse score in the README.
