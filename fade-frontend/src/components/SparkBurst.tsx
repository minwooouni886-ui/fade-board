type Props = { className?: string }

/** Decorative spark-burst mark for the "Spark a Fresh Community Board" tile. */
export default function SparkBurst({ className = '' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sb-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe3da" />
          <stop offset="0.45" stopColor="#ff8a65" />
          <stop offset="1" stopColor="#ff5a2c" />
        </linearGradient>
        <radialGradient id="sb-glow" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b4a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff6b4a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="24" cy="24" r="22" fill="url(#sb-glow)" />

      {/* slow orbiting dashed ring */}
      <circle
        className="sb-orbit"
        cx="24"
        cy="24"
        r="16.5"
        stroke="#ffb4a3"
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 7"
      />

      {/* diagonal accent rays */}
      <g stroke="#ffb4a3" strokeWidth="2.6" strokeLinecap="round">
        <path d="M24 24 33.5 14.5" />
        <path d="M24 24 14.5 33.5" strokeOpacity="0.75" />
      </g>

      {/* main 4-point sparkle */}
      <path
        d="M24 2.5 Q29 19 45.5 24 Q29 29 24 45.5 Q19 29 2.5 24 Q19 19 24 2.5 Z"
        fill="url(#sb-grad)"
      />

      {/* inner light + accents */}
      <circle cx="20.6" cy="20.6" r="3.1" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="10" cy="37.5" r="1.9" fill="#ff6b4a" />
      <g className="sb-twinkle">
        <path
          d="M38 5 Q39.4 10 44 11 Q39.4 12 38 17 Q36.6 12 32 11 Q36.6 10 38 5 Z"
          fill="#ffdf90"
        />
      </g>
    </svg>
  )
}
