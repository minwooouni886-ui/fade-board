/**
 * Static mock dataset matching the Stitch design mockups.
 * Preview images use picsum.photos (seeded) and avatars use pravatar.cc so the
 * layout renders fully without a backend. Swap for real API data later.
 */

export type Community = {
  id: number
  name: string
  category: string
  categoryIcon: string
  categoryTone: string
  description: string
  image: string
  distanceLabel: string
  avatars: string[]
  overflowCount: number
  members: number
  liveSparks: number
}

export type Spark = {
  id: number
  communityId: number
  author: { name: string; avatar: string; meta: string; verified?: boolean; badge?: string }
  countdown: { icon: string; label: string; tone: 'error' | 'secondary'; urgent?: boolean }
  /** 0..1 remaining lifespan for the top strip */
  decay: number
  decayUrgent?: boolean
  title: string
  body: string
  image?: { src: string; pin?: string }
  figma?: { file: string; src: string }
  tags: { label: string; tone: 'secondary' | 'tertiary' | 'primary' | 'muted' }[]
  boosts: number
  comments: number
}

const img = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`
const face = (n: number) => `https://i.pravatar.cc/96?img=${n}`

export const currentUser = {
  name: 'Alex Vance',
  avatar: face(12),
  status: '3 active Sparks',
}

export const communities: Community[] = [
  {
    id: 1,
    name: 'SoHo Creatives & Designers',
    category: 'Design & Creative',
    categoryIcon: 'brush',
    categoryTone: 'text-secondary',
    description:
      'Weekly critique ring for typography buffs, risograph printer swaps, and freelance deck feedback around Broadway.',
    image: img('soho-creatives'),
    distanceLabel: '0.4 km • Greene St',
    avatars: [face(1), face(5), face(8)],
    overflowCount: 42,
    members: 280,
    liveSparks: 42,
  },
  {
    id: 2,
    name: 'East Village Indie Coffee & Night Owls',
    category: 'Coffee & Night Owls',
    categoryIcon: 'nightlife',
    categoryTone: 'text-primary',
    description:
      'Tracking which roasters have free WiFi, espresso beans on tap, and late evening ambient workspace tables open past 9 PM.',
    image: img('ev-coffee'),
    distanceLabel: '1.2 km • St. Marks Pl',
    avatars: [face(33), face(45)],
    overflowCount: 28,
    members: 173,
    liveSparks: 24,
  },
]


export const categoryPills = [
  { label: 'All Active (18)', icon: 'grid_view', tone: '', active: true },
  { label: 'Design & Creative', icon: 'palette', tone: 'text-secondary' },
  { label: 'Buy/Sell Swaps', icon: 'swap_horiz', tone: 'text-tertiary' },
  { label: 'Nightlife & Coffee', icon: 'local_cafe', tone: 'text-primary' },
  { label: 'Study Pods', icon: 'school', tone: 'text-secondary' },
  { label: 'Greenery', icon: 'potted_plant', tone: 'text-tertiary' },
]

export const sparks: Spark[] = [
  {
    id: 101,
    communityId: 1,
    author: {
      name: 'Maya Lin',
      avatar: face(47),
      meta: 'Product Designer • SoHo Loft Studio',
      verified: true,
    },
    countdown: { icon: 'alarm', label: '4h 12m left', tone: 'error', urgent: true },
    decay: 0.09,
    decayUrgent: true,
    title: 'Open Studio Desk Available for 2 Days near Prince St!',
    body:
      'Traveling to Boston for client workshops and our corner sunlit desk at 124 Prince is completely free today and tomorrow. 4K Dell display, gigabit fiber, and bottomless Chemex batch brew. Drop a spark or DM to claim the keycode before this Spark fades at midnight!',
    image: { src: img('prince-st-studio', 900, 480), pin: 'Prince St & Greene St • 0.3 mi' },
    tags: [
      { label: '#DeskShare', tone: 'secondary' },
      { label: '#Studio', tone: 'muted' },
      { label: '#SoHoLocal', tone: 'tertiary' },
      { label: '#FreeAccess', tone: 'muted' },
    ],
    boosts: 24,
    comments: 8,
  },
  {
    id: 102,
    communityId: 1,
    author: {
      name: 'Julian K.',
      avatar: face(53),
      meta: '2d ago • Product & Brand Systems',
      badge: 'Core Contributor',
    },
    countdown: { icon: 'hourglass_top', label: '4 days left', tone: 'secondary' },
    decay: 0.57,
    title: 'Design critique: Redesigning our local bookshop checkout',
    body:
      'Rethinking the in-store touch kiosk for McNally Jackson on Prince. Focused on ultra-fast card scan, staff recommendations carousel, and zero friction paperless receipts. Would love feedback on the mobile-first checkout modal stack before we cut code this Friday!',
    figma: { file: 'Checkout_v03_revised.fig', src: img('figma-checkout', 900, 520) },
    tags: [
      { label: '#Critique', tone: 'primary' },
      { label: '#UIUX', tone: 'muted' },
      { label: '#Bookstore', tone: 'secondary' },
      { label: '#FigmaDesign', tone: 'muted' },
    ],
    boosts: 31,
    comments: 14,
  },
  {
    id: 103,
    communityId: 1,
    author: {
      name: 'Elena Rostova',
      avatar: face(31),
      meta: '6h ago • Mercer Creative Lab',
      badge: 'Agency Lead',
    },
    countdown: { icon: 'schedule', label: '6 days left', tone: 'secondary' },
    decay: 0.85,
    title: 'Looking for a freelance Figma system engineer this week',
    body:
      'Need an expert to clean up token naming hierarchies, configure mode-switching variables (Dark/Light/Dimmed), and prepare a 40-component kit for handover to an engineering team on Broadway. Fast turnaround starting tomorrow.',
    tags: [
      { label: '#FigmaTokens', tone: 'tertiary' },
      { label: '#GigWork', tone: 'secondary' },
      { label: '#Freelance', tone: 'primary' },
    ],
    boosts: 45,
    comments: 6,
  },
]

export const fadingToday = [
  {
    left: '1h 45m left',
    tone: 'text-primary',
    handle: '@lucas_3d',
    title: 'Free Risograph print runs for local zine makers',
    place: 'Greene St Studio',
  },
  {
    left: '3h 05m left',
    tone: 'text-primary-container',
    handle: '@sara_ux',
    title: 'Looking for iOS test users (Coffee on me at Ground Support)',
    place: 'West Broadway',
  },
  {
    left: '5h 20m left',
    tone: 'text-tertiary',
    handle: '@arch_soho',
    title: 'Leftover heavy foamcore & mount boards outside 92 Mercer',
    place: 'Mercer & Spring',
  },
]

export const filterTabs = [
  { key: 'trending', label: 'Trending Now', icon: 'local_fire_department', tone: '' },
  { key: 'expiring', label: 'Expiring Soon', icon: 'hourglass_bottom', tone: 'text-primary-container', dot: true },
]
