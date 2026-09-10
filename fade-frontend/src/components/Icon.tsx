type IconProps = {
  name: string
  className?: string
  title?: string
}

/** Material Symbols Outlined glyph (font loaded in index.html). */
export default function Icon({ name, className = '', title }: IconProps) {
  return (
    <span className={`material-symbols-outlined ${className}`} title={title} aria-hidden={title ? undefined : true}>
      {name}
    </span>
  )
}
