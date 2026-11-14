// A static map of a board's spot, made from OpenStreetMap tiles (shown in their normal colors;
// the paper color only shows while the tiles load).
// shortcut: uses the public OSM tile server, which is fine for a demo but not for heavy traffic
// (see the tile usage policy); swap TILE_URL for a provider like MapTiler once the site has real users.
const TILE_URL = 'https://tile.openstreetmap.org'
const TILE = 256

type Props = {
  lat: number
  lon: number
  paper: string
  zoom?: number
  // How many tiles to draw on each side of the center tile; enough to cover the widest use
  spanX?: number
  spanY?: number
  className?: string
}

// Standard Web Mercator: where a coordinate lands, in pixels, on the whole-world map at this zoom
function worldPixel(lat: number, lon: number, zoom: number) {
  const size = TILE * 2 ** zoom
  const rad = (lat * Math.PI) / 180
  return {
    x: ((lon + 180) / 360) * size,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * size,
  }
}

export default function MapCover({ lat, lon, paper, zoom = 15, spanX = 2, spanY = 1, className = '' }: Props) {
  const { x, y } = worldPixel(lat, lon, zoom)
  const cx = Math.floor(x / TILE)
  const cy = Math.floor(y / TILE)

  const tiles = []
  for (let dy = -spanY; dy <= spanY; dy++) {
    for (let dx = -spanX; dx <= spanX; dx++) {
      const tx = cx + dx
      const ty = cy + dy
      tiles.push(
        <img
          key={`${tx}-${ty}`}
          src={`${TILE_URL}/${zoom}/${tx}/${ty}.png`}
          alt=""
          loading="lazy"
          draggable={false}
          className="absolute h-64 w-64 max-w-none"
          // Placed so the board's exact spot sits in the middle of the frame
          style={{ left: `calc(50% + ${tx * TILE - x}px)`, top: `calc(50% + ${ty * TILE - y}px)` }}
        />,
      )
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ backgroundColor: paper }}>
      {/* Decorative: the place is also written out as text next to every map */}
      <div aria-hidden="true">{tiles}</div>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full border-[3px] border-ink bg-sun"
      />
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 bg-paper/85 px-1 text-[11px] leading-4 text-ink underline-offset-2 hover:underline"
      >
        © OpenStreetMap contributors
      </a>
    </div>
  )
}
