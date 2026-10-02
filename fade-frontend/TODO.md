# Removed features — not implemented yet

Stripped out of `Community.tsx` and `data/mock.ts` because they were either dead
code or fully non-functional UI with no backend behind them. Kept here so
nothing gets forgotten. Re-add when the backend support exists.

## 1. Dead mock code (`data/mock.ts`)
The `Spark` type and `sparks` array. Not removed for a feature reason — just
stale leftovers after `SparkCard` was switched to consume real `ApiPost` data
from the backend instead of mock data. Nothing to reimplement here.

## 2. "Trending Now / Expiring Soon" tabs (`Community.tsx`)
Two pill buttons above the feed. `activeTab` state existed and visually
highlighted the selected tab, but never actually filtered `feed` — clicking
them did nothing to what posts were shown.

To bring back for real: decide what "Trending" means (most-recently-created?
some future boost count?) and what "Expiring Soon" means (e.g. `expires_at`
within the next N hours), then filter/sort `feed` based on `activeTab` before
mapping it to `SparkCard`s.

## 3. "Fading Out Today" sidebar widget (`Community.tsx`)
Sidebar card listing 3 hardcoded posts about to expire. No backend endpoint
backed this at all — the data was 100% static in `mock.ts`.

To bring back for real: this needs to query posts across the *current*
community (or all communities?) where `expires_at` is within ~6 hours, sorted
soonest-first. Could reuse `fetchCommunityPosts` and filter client-side like
`feed` already does, or add a dedicated backend query if you want it to
span multiple communities.

## 4. "Ignite Spark" composer (`Community.tsx`)
The textarea + "Fade after: 24h / 3d / 7d Max" buttons + attach icons +
"Ignite Spark" submit button. Fully inert — no `onSubmit`/`onClick` ever
called the backend. `draft`/`lifespan` state existed but had no consumer.

To bring back for real:
1. Add a `createPost(communityId, { title, description, category,
   duration_hours })` function to `api.ts` — a `POST` to
   `/api/communities/:id/posts` (see `postsRoutes.js` for what it expects:
   `title` and `duration_hours` are required, `duration_hours` must be
   1–168).
2. Wire the submit button's `onClick` to call it, then either refetch
   `posts` or prepend the returned row to the existing `posts` state.
3. Surface the backend's 400 validation errors in the UI instead of failing
   silently.

## 5. Category filter pills on Home (`data/mock.ts`, rendered in `Home.tsx`)
`categoryPills` used to have 6 entries: "All Active (18)", "Design & Creative",
"Buy/Sell Swaps", "Nightlife & Coffee", "Study Pods", "Greenery". Only "All
Active (18)" is left. Same problem as the other removals — clicking a pill
never filtered `sortedCommunities` at all; there was no state tied to
category selection, `pill.active` was just a hardcoded `true` on one mock
entry. `sortedCommunities` in `Home.tsx` only ever reacts to the `sort`
dropdown, never to category.

To bring back for real:
1. The DB has no `category` column on `communities` (only on `posts`) — decide
   whether communities need one, or whether "category" here should instead
   come from aggregating each community's posts' categories.
2. Add a `selectedCategory` state (`useState`) in `Home.tsx`, wire each pill's
   `onClick` to set it, and derive `pill.active` from
   `pill.label === selectedCategory` instead of a hardcoded mock field.
3. Filter `sortedCommunities` by the selected category before sorting.
4. The `(18)` count in "All Active (18)" is also hardcoded — should be
   `communities.length` once this is real.

## 6. Top bar (`components/Topbar.tsx`, deleted)
Fixed header with a hardcoded "Delft, Netherlands (2km)" location chip, a
search input ("Search local boards, sparks, tags..."), a "Filter Radius"
button and a "New Spark" button. None of it was wired to anything.
`Layout.tsx` had `pt-16` on `<main>` to make room for it.

To bring back for real: location needs either browser geolocation or a
user setting, plus a `location`-based query on the backend. Search needs a
search endpoint (or client-side filtering of loaded communities/posts).

## 7. Sidebar extras (`components/Sidebar.tsx`)
- "My Boards" nav link to `/my-boards`: the route never existed in `App.tsx`.
  Could list the boards from `useMembership` once membership is persisted.
- "Expiring Soon (24h)" and "Activity & Sparks" links: `href="#..."` anchors
  that went nowhere.
- Profile button at the bottom showing the fake `currentUser` ("Alex Vance")
  from `mock.ts`. Needs a real user/auth system first.

## 8. Home page extras (`pages/Home.tsx`)
- "Radius Active: 2.5 km" badge and "Within 2.0 km" button: hardcoded,
  no radius logic anywhere.
- "Active Nearby: 142 Sparks / Fading Today: 38 Sparks" stats: hardcoded
  numbers. Could come from a backend count query (posts where
  `expires_at > now`, and `expires_at` within 24h).
- "Spark a Fresh Community Board" tile with "Read Board Guidelines" and
  "Pin New Board" buttons (no `onClick`). Also deleted
  `components/SparkBurst.tsx` (its icon) and the `.spark-burst` CSS in
  `index.css`. Bringing it back means a `POST /api/communities` endpoint
  and a create-community form.
- Category pills (see #5): the remaining "All Active (18)" pill and the
  `categoryPills` export in `mock.ts` are now gone too, along with the
  `.no-scrollbar` CSS they used.

## 9. Community page extras (`pages/Community.tsx`)
- Filter input ("Filter tags, authors, roles...") and "New Spark" button
  from the action bar. "New Spark" pairs with the composer in #4.
- Right sidebar column with a "Board Policy & Ethics" link (`#policy`,
  went nowhere). The feed is now a single column (`max-w-3xl`).

## 10. Member avatars on community cards (`components/CommunityCard.tsx`)
Row of 2–3 stock faces (pravatar.cc) plus a "+42" overflow bubble, from the
`avatars` / `overflowCount` mock fields. There's no account system, so they
were fake. To bring back: once users exist, have the backend return a few
member avatars and the total member count per community.

## 11. Mock-only community fields (`data/mock.ts`, `CommunityCard.tsx`)
Removed because the backend has no data for them:
- Category tag on each card (`category`, `categoryIcon`, `categoryTone`).
  The `communities` table has no `category` column (see #5).
- "N members" count (`members`) and `memberCount()` in the membership
  context, which added 1 when you'd joined. Needs a real membership table.
- "N live Sparks" count (`liveSparks`) and the "Most Active" sort that used
  it. Could come from a backend count of non-expired posts per community.
- On the board page: the "N members online" counter (was always 0, or 1 if
  joined) and the hardcoded "Live Hub" badge. The "N live Sparks" counter
  there is real (it's `feed.length`) and was kept.

## 12. Post author on Spark cards (`components/SparkCard.tsx`)
Grey person-icon avatar plus the hardcoded name "Community Member" on every
post. No author system exists. To bring back: add an author/user to posts
on the backend, return it from `GET /communities/:id/posts`, and render it
in the SparkCard header next to the category.

## Still using mock data
`Home.tsx` reads communities from `data/mock.ts`, not the backend.
`fetchCommunities()` in `api.ts` already exists. Switch Home to it (with
loading/error states like `Community.tsx`). Note the mock still has two fields
the backend doesn't (`image`, `distanceLabel`), so `CommunityCard` will need
adjusting too. `distanceLabel` is for when PostGIS is in.

## 13. Join Board / membership (`context/`, deleted)
`MembershipProvider.tsx` + `membership.ts` held a `Set` of joined board IDs
in React Context. "Join Board" on a community card had to be clicked before
"Enter Board" appeared, and the board page had a Join/Joined button. It was
browser-memory only (lost on refresh) and there are no user accounts, so it
was removed. Cards now always show "Enter Board".

To bring back for real: needs user accounts first, then a `memberships`
table (user_id, community_id) with join/leave endpoints. The frontend can
then fetch the user's memberships and show Join/Leave again.
