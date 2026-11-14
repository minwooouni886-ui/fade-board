// Paper, sticker and tilt choices for the cut-out notes and boards.

// Five papers so runs of the same color stay rare (with four, 7 of 16 test notes came out yellow)
const papers = ['#FFFFFF', '#FFD23F', '#9EE2C8', '#FFB4A2', '#A9D6FF'] // white, sun yellow, mint, peach, sky
// Sticker colors all keep white 12px text at 4.5:1 or better
const stickers = ['#C2410C', '#3D5AFE', '#1F1A3A', '#B8287F'] // orange, blue, ink, magenta
const tilts = [-3, 2, -1.2, 2.8, -2.2, 1]

// Scrambles an id (murmur3's finalizer) so neighbouring notes don't fall into a color pattern.
// Post ids are shared by every board, so no plain id % n pattern could keep neighbours apart anyway.
function scramble(id: number) {
  let x = id
  x ^= x >>> 16
  x = Math.imul(x, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return x >>> 0
}

// A board's default image, until boards can have an uploaded one: one of the bundled photos in
// public/covers (free Unsplash photos, see the README), chosen by the board's id
const COVER_COUNT = 8
export function coverFor(id: number) {
  // Stepping by 3 (which shares no factor with 8) walks through all 8 photos before repeating,
  // so boards made one after another get different photos
  return `/covers/cover-${((id * 3) % COVER_COUNT) + 1}.jpg`
}

// Each note or board gets a paper color, a sticker color and a slight tilt from its id,
// so the page looks pasted up by hand but stays the same between reloads
export function paperFor(id: number) {
  const h = scramble(id)
  const tilt = tilts[(h >>> 8) % tilts.length]
  return {
    paper: papers[h % papers.length],
    sticker: stickers[(h >>> 16) % stickers.length],
    tilt: `${tilt}deg`,
    // Stickers lean the other way from their note, so they look stuck on separately
    stickerTilt: `${-tilt * 1.5}deg`,
  }
}
