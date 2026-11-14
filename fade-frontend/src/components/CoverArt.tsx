import { coverFor } from '../paper'

// A board's image. For now every board uses one of the bundled default photos; an uploaded photo
// would slot in here later. The paper color shows while the photo loads.
// Callers set the size and positioning through className.
export default function CoverArt({ id, paper, className = '' }: { id: number; paper: string; className?: string }) {
  return (
    <img
      src={coverFor(id)}
      alt=""
      loading="lazy"
      draggable={false}
      className={`object-cover ${className}`}
      style={{ backgroundColor: paper }}
    />
  )
}
