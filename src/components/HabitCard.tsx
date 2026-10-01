import { CalendarDays, Check, Trash2 } from 'lucide-react'
import { analyze, dk } from '#/lib/streak'
import type { Habit } from '#/lib/queries'

export function HabitCard({ habit, onToggle, onCalendar, onDelete }: {
  habit: Habit; onToggle: () => void; onCalendar: () => void; onDelete: () => void
}) {
  const a = analyze(habit.days)
  const set = new Set(habit.days)
  const on = set.has(dk(new Date()))
  const dots = Array.from({ length: 7 }, (_, k) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - k))
    return { hit: set.has(dk(d)), today: k === 6, label: d.toLocaleDateString('id-ID', { weekday: 'narrow' }) }
  })

  return (
    <article
      className={`mb-3.5 rounded-[22px] border-2 border-b-[5px] p-4 ${
        a.frozen ? 'border-ice/60 bg-[color-mix(in_srgb,var(--ice)_12%,var(--card))]' : 'border-line bg-card'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Lihat kalender"
        className="flex cursor-pointer items-center gap-3"
        onClick={onCalendar}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCalendar() } }}
      >
        <div className="grid size-13 flex-none place-items-center rounded-2xl bg-bg text-[28px]">{habit.icon}</div>
        <div className="min-w-0 flex-1 text-[18px] font-extrabold wrap-anywhere">
          {habit.name}
          <small className="block text-[13px] font-bold text-mute">
            {a.frozen ? `Beku · streak ${a.lost} hari putus · Terbaik ${a.best}` : `Terbaik: ${a.best} hari · Total: ${a.total}`}
          </small>
        </div>
        {a.frozen ? (
          <div className="text-[22px] font-black whitespace-nowrap text-ice" title="Streak beku">❄️ 0</div>
        ) : (
          <div className={`text-[22px] font-black whitespace-nowrap ${a.current ? 'text-fire' : 'text-mute'}`}>{a.current ? '🔥 ' : ''}{a.current}</div>
        )}
      </div>

      <div className="mx-0.5 my-3.5 flex justify-between">
        {dots.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.25 text-xs font-extrabold text-mute">
            <i className={`grid size-7.5 place-items-center rounded-full text-[15px] text-white not-italic ${d.hit ? 'bg-fire' : 'bg-empty'} ${d.today ? 'outline-3 outline-offset-2 outline-sun' : ''}`}>
              {d.hit ? '✓' : ''}
            </i>
            {d.label}
          </div>
        ))}
      </div>

      <button className={`btn btn-go ${on ? 'done' : a.frozen ? 'frozen' : ''}`} onClick={onToggle}>
        {on ? <><Check size={20} strokeWidth={3.5} />Sudah selesai hari ini</> : a.frozen ? 'Mulai lagi hari ini' : 'Selesai hari ini'}
      </button>

      <div className="mt-4 flex items-center justify-end gap-2 text-[13px] font-bold text-mute">
        <span className="flex gap-2">
          <button className="btn btn-sm btn-ghost" onClick={onCalendar}><CalendarDays size={15} className="text-fire" strokeWidth={2.5} />Kalender</button>
          <button className="btn btn-sm btn-danger" onClick={onDelete}><Trash2 size={15} strokeWidth={2.5} />Hapus</button>
        </span>
      </div>
    </article>
  )
}
