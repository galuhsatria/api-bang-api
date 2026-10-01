export function Flame({ ice = false, className = '' }: { ice?: boolean; className?: string }) {
  const [a, b] = ice ? ['#4CC9F0', '#C9F1FF'] : ['#FF7A1A', '#FFC93C']
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className={className}>
      <path d="M256 60C280 150 380 190 380 310C380 390 325 450 256 450C187 450 132 390 132 310C132 250 170 215 195 180C205 215 225 232 240 232C235 160 240 110 256 60Z" fill={a} />
      <path d="M256 250C275 290 320 310 320 360C320 400 292 425 256 425C220 425 192 400 192 360C192 320 230 300 256 250Z" fill={b} />
    </svg>
  )
}
