type LogoProps = {
  className?: string
  title?: string
  /** ambient staggered "decay" animation on the bars (default on) */
  animated?: boolean
}

/** fade brand lockup — fading decay bars + wordmark. */
export default function Logo({
  className = 'h-9 w-auto',
  title = 'fade',
  animated = true,
}: LogoProps) {
  return (
    <svg
      className={`${animated ? 'fade-logo ' : ''}${className}`}
      viewBox="12 14 166 52"
      preserveAspectRatio="xMinYMid meet"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="fade-logo-bar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8A65" />
          <stop offset="100%" stopColor="#FF6B4A" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Fading horizontal bars — dissipation / decay */}
      <g transform="translate(15, 16)">
        <rect className="flb flb-1" x="0" y="8" width="44" height="6.5" rx="3.25" fill="#FF6B4A" />
        <rect
          className="flb flb-2"
          x="0"
          y="21"
          width="32"
          height="6.5"
          rx="3.25"
          fill="url(#fade-logo-bar)"
        />
        <rect
          className="flb flb-3"
          x="0"
          y="34"
          width="18"
          height="6.5"
          rx="3.25"
          fill="#FF6B4A"
          opacity="0.35"
        />
        <circle cx="28" cy="37.25" r="3.25" fill="#FF6B4A" opacity="0.15" />
      </g>
      {/* Wordmark */}
      <text
        x="75"
        y="49"
        fontFamily="'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="36"
        fontWeight="700"
        letterSpacing="-1.5"
        fill="currentColor"
      >
        fade
      </text>
      <circle className="fld" cx="162" cy="45" r="3.5" fill="#FF6B4A" />
    </svg>
  )
}
