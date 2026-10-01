import { analyze, dk } from '#/lib/streak'
import { SLOT_ICON, SLOT_START, slotOf, widgetMessage, type WidgetState } from '#/lib/messages'
import type { Habit } from '#/lib/queries'

export function Widget({ habits }: { habits: Habit[] }) {
  const now = new Date()
  const slot = slotOf(now)
  const today = dk(now)
  const pending = habits.filter((h) => !h.days.includes(today)).length
  const frozen = habits.some((h) => analyze(h.days).frozen)

  const state: WidgetState = !habits.length ? 'empty'
    : now.getHours() === SLOT_START[slot] ? 'greet'
    : !pending ? 'done'
    : frozen ? 'frozen'
    : 'nudge'

  const msg = widgetMessage(state, slot, `${today}-${slot}-${state}`)
  const icon = state === 'frozen' ? '❄️' : state === 'done' ? '🔥' : SLOT_ICON[slot]

  return (
    <aside className="mb-4 flex items-center gap-3 rounded-[22px] border-2 border-b-[5px] border-line bg-card p-3.5">
      <span className="grid size-14 flex-none place-items-center rounded-2xl bg-bg text-[30px]">{icon}</span>
      <div>
        <p className="text-xl leading-tight font-black">{msg}</p>
        {habits.length > 0 && (
          <p className="text-[13px] font-bold text-mute">{pending ? `${pending} kegiatan belum selesai` : 'Semua beres hari ini'}</p>
        )}
      </div>
    </aside>
  )
}
