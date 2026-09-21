type BrandProps = {
  className?: string
}

function ToiletRoll() {
  return (
    <svg className="toilet-roll" viewBox="0 0 28 30" aria-hidden="true">
      <path d="M5 6.5c0-3 4-5 9-5s9 2 9 5v17c0 3-4 5-9 5s-9-2-9-5v-17Z" />
      <path className="toilet-roll-shadow" d="M19 2.7c2.4.9 4 2.2 4 3.8v17c0 2.4-2.6 4.2-6.1 4.8 1.3-1.1 2.1-2.6 2.1-4.3v-17c0-1.6-.8-3.1-2.1-4.3.7 0 1.4 0 2.1.1Z" />
      <ellipse className="toilet-roll-hole" cx="14" cy="7" rx="3.2" ry="1.9" />
      <path className="toilet-roll-sheet" d="M5 16.5h18" />
    </svg>
  )
}

export function Brand({ className = '' }: BrandProps) {
  return (
    <span className={`brand-wordmark ${className}`} role="img" aria-label="WePoop">
      <span aria-hidden="true">WeP</span>
      <span className="toilet-rolls" aria-hidden="true">
        <ToiletRoll />
        <ToiletRoll />
      </span>
      <span aria-hidden="true">p</span>
    </span>
  )
}
