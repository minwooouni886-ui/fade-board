// fade logo: each letter cut out of its own paper, the way a zine collage spells a title.
// The last two letters are lighter, so the word itself fades out.
const letters = [
  { char: 'f', paper: '#FFD23F', tilt: -6, opacity: 1 },
  { char: 'a', paper: '#9EE2C8', tilt: 4, opacity: 1 },
  { char: 'd', paper: '#FFB4A2', tilt: -3, opacity: 0.75 },
  { char: 'e', paper: '#FFFFFF', tilt: 5, opacity: 0.45 },
]

export default function Logo({ className = '' }: { className?: string }) {
  return (
    // The letters are decorative pieces, so screen readers get the word once
    <span role="img" aria-label="fade" className={`inline-flex items-center gap-[3px] ${className}`}>
      {letters.map(({ char, paper, tilt, opacity }) => (
        <span
          key={char}
          aria-hidden="true"
          className="inline-block border-[1.5px] border-ink px-[0.14em] pb-[0.14em] pt-[0.06em] font-black leading-none text-ink shadow-[2px_2px_0_#1F1A3A]"
          style={{ backgroundColor: paper, transform: `rotate(${tilt}deg)`, opacity }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
