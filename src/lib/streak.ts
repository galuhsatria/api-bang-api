import { useEffect, useState } from 'react'

export const MILESTONES = [3, 7, 14, 30, 50, 100, 365]

const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
export const dk = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const dn = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 864e5
}

export function analyze(days: string[]) {
  const ns = [...new Set(days.map(dn))].sort((a, b) => a - b)
  let best = 0, run = 0, prev: number | null = null
  for (const n of ns) {
    run = prev !== null && n - prev === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = n
  }
  const alive = prev !== null && dn(dk(new Date())) - prev <= 1
  const frozen = ns.length > 0 && !alive
  return { current: alive ? run : 0, best, total: ns.length, frozen, lost: frozen ? run : 0 }
}

export function useTick(ms = 60_000) {
  const [, set] = useState(0)
  useEffect(() => {
    const i = setInterval(() => set((n) => n + 1), ms)
    const v = () => { if (!document.hidden) set((n) => n + 1) }
    document.addEventListener('visibilitychange', v)
    return () => { clearInterval(i); document.removeEventListener('visibilitychange', v) }
  }, [ms])
}
