/**
 * Static mock dataset matching the Stitch design mockups.
 * Preview images use picsum.photos (seeded) so the
 * layout renders fully without a backend. Swap for real API data later.
 */

export type Community = {
  id: number
  name: string
  description: string
  image: string
  distanceLabel: string
}

const img = (seed: string, w = 800, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

export const communities: Community[] = [
  {
    id: 1,
    name: 'TU Delft Makerspace Crew',
    description:
      'Weekly critique ring for prototyping nerds, 3D printer swaps, and thesis poster feedback around Mekelpark.',
    image: img('delft-makerspace'),
    distanceLabel: '0.4 km • Mekelweg',
  },
  {
    id: 2,
    name: 'Oude Delft Coffee & Night Owls',
    description:
      'Tracking which cafés along the canal have free WiFi, strong koffie verkeerd, and late evening study tables open past 9 PM.',
    image: img('oude-delft-canal'),
    distanceLabel: '1.2 km • Oude Delft',
  },
]


