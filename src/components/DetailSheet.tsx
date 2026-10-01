import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Sheet } from '#/components/Sheet'
import { analyze, dk } from '#/lib/streak'
import type { Habit } from '#/lib/queries'

const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const now = () => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() } }

export function DetailSheet({ habit, onClose }: { habit: Habit | null; onClose: () => void }) {
  const [ym, setYm] = useState(now)
  useEffect(() => { if (habit) setYm(now()) }, [habit?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!habit) return <Sheet open={false} onClose={onClose} label="Detail kegiatan">{null}</Sheet>

  const a = analyze(habit.days)
  const set = new Set(habit.days)
  const today = dk(new Date())
  const cur = now()
  const atNow = ym.y > cur.y || (ym.y === cur.y && ym.m >= cur.m)
  const off = (new Date(ym.y, ym.m, 1).getDay() + 6) % 7
  const total = new Date(ym.y, ym.m + 1, 0).getDate()
  const move = (n: number) => setYm((p) => { const d = new Date(p.y, p.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  let cnt = 0

  const cells = Array.from({ length: total }, (_, i) => {
    const k = dk(new Date(ym.y, ym.m, i + 1))
    const on = set.has(k)
    if (on) cnt++
    const cls = on ? 'bg-fire text-white' : k > today ? 'border-2 border-dashed border-line opacity-50' : 'bg-empty text-mute'
    return <span key={k} className={`grid aspect-square place-items-center rounded-xl text-sm font-extrabold ${cls} ${k === today ? 'outline-3 outline-offset-2 outline-sun' : ''}`}>{i + 1}</span>
  })

  return (
    <Sheet open onClose={onClose} label="Detail kegiatan">
      <div className="flex items-center gap-3">
        <div className="grid size-13 flex-none place-items-center rounded-2xl bg-bg text-[28px]">{habit.icon}</div>
        <div className="min-w-0 flex-1 text-[18px] font-extrabold wrap-anywhere">{habit.name}</div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}><X size={16} strokeWidth={3} />Tutup</button>
      </div>

      <div className="my-4 grid grid-cols-3 gap-2">
        {[[a.frozen ? '❄️' : a.current, 'Streak'], [a.best, 'Terbaik'], [a.total, 'Total']].map(([v, l]) => (
          <div key={l} className="rounded-[14px] bg-bg px-1.5 py-2.5 text-center text-xs font-extrabold text-mute">
            <b className={`block text-[22px] font-black ${a.frozen && l === 'Streak' ? 'text-ice' : 'text-fire'}`}>{v}</b>{l}
          </div>
        ))}
      </div>

      <div className="mb-2.5 flex items-center justify-between">
        <button className="btn btn-ghost size-10 p-0" aria-label="Bulan sebelumnya" onClick={() => move(-1)}><ChevronLeft size={20} strokeWidth={3} /></button>
        <b className="text-[17px] capitalize">{new Date(ym.y, ym.m, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</b>
        <button className="btn btn-ghost size-10 p-0 disabled:opacity-30" aria-label="Bulan berikutnya" disabled={atNow} onClick={() => move(1)}><ChevronRight size={20} strokeWidth={3} /></button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DOW.map((d) => <span key={d} className="pb-1 text-center text-xs font-extrabold text-mute">{d}</span>)}
        {Array.from({ length: off }, (_, i) => <span key={'p' + i} />)}
        {cells}
      </div>
      <p className="mt-3.5 text-center text-[13px] font-bold text-mute">{cnt} hari selesai di bulan ini</p>
    </Sheet>
  )
}
