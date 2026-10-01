import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Contrast } from 'lucide-react'
import { ConfirmSheet } from '#/components/ConfirmSheet'
import { DetailSheet } from '#/components/DetailSheet'
import { Flame } from '#/components/Flame'
import { HabitCard } from '#/components/HabitCard'
import { NewHabitSheet } from '#/components/NewHabitSheet'
import { toast } from '#/components/Toaster'
import { Widget } from '#/components/Widget'
import { useAddHabit, useDeleteHabit, useHabits, useSettings, useSounds, useSyncTimezone, useToggle, type Habit } from '#/lib/queries'
import { prefetch, playSound } from '#/lib/sounds'
import { MILESTONES, analyze, dk, useTick } from '#/lib/streak'

export const Route = createFileRoute('/_app/')({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => (s.new ? { new: true } : {}),
  component: StreakPage,
})

function toggleTheme() {
  const r = document.documentElement
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  r.dataset.theme = dark ? 'light' : 'dark'
  try { localStorage.setItem('runut.theme', r.dataset.theme) } catch { /* abaikan */ }
}

function StreakPage() {
  useTick()
  useSyncTimezone()
  const { data: habits = [], isLoading, isError } = useHabits()
  const { data: settings } = useSettings()
  const { data: sounds = [] } = useSounds()
  const toggle = useToggle()
  const add = useAddHabit()
  const del = useDeleteHabit()

  // sheet "Kegiatan baru" dibuka lewat tombol di bottom nav (?new=true)
  const { new: adding } = Route.useSearch()
  const navigate = useNavigate()
  const closeAdd = () => navigate({ to: '/', search: {}, replace: true })

  const [detailId, setDetailId] = useState<string | null>(null)
  const [delTarget, setDelTarget] = useState<Habit | null>(null)
  const [pop, setPop] = useState(0)

  useEffect(() => { prefetch(sounds) }, [sounds])

  const today = dk(new Date())
  const stats = habits.map((h) => analyze(h.days))
  const top = Math.max(0, ...stats.map((s) => s.current))
  const anyFrozen = stats.some((s) => s.frozen)
  const doneToday = habits.filter((h) => h.days.includes(today)).length

  function onToggle(h: Habit) {
    const on = h.days.includes(today)
    toggle.mutate({ habit: h.id, day: today, on }, { onError: () => toast('Gagal menyimpan, coba lagi') })
    if (on) return
    const s = analyze([...h.days, today]).current
    setPop((n) => n + 1)
    const milestone = MILESTONES.includes(s)
    toast(milestone ? `🔥 ${s} hari beruntun! Keren banget` : `Mantap! Streak ${s} hari`)
    playSound(milestone ? 'milestone' : 'check', sounds, settings?.sound_mode ?? 'random', settings?.muted ?? false)
    navigator.vibrate?.(40)
  }

  return (
    <>
      <section className="mt-2 mb-5 flex items-center gap-3.5">
        <Flame
          key={pop}
          ice={top === 0 && anyFrozen}
          className={`size-21 flex-none drop-shadow-[0_6px_10px_rgba(255,122,26,.35)] ${top === 0 && !anyFrozen ? 'opacity-45 grayscale' : ''} ${pop ? 'animate-pop' : ''}`}
        />
        <div>
          <b className="block text-[56px] leading-none font-black tracking-[-2px]">{top}</b>
          <span className="block text-[15px] font-bold text-mute">hari beruntun terpanjang</span>
          <small className="mt-0.5 block text-[13px] text-mute">
            {habits.length ? `${doneToday} dari ${habits.length} kegiatan selesai hari ini` : 'Streak dimulai dari satu langkah'}
          </small>
        </div>
        <button className="ml-auto self-start p-1.5 text-ink" aria-label="Ganti tema" onClick={toggleTheme}>
          <Contrast size={22} />
        </button>
      </section>

      <Widget habits={habits} />

      {isLoading ? (
        <p className="py-9 text-center font-bold text-mute">Memuat…</p>
      ) : isError ? (
        <p className="py-9 text-center font-bold text-danger">Gagal memuat data. Tarik ulang halaman.</p>
      ) : habits.length === 0 ? (
        <div className="px-5 py-9 text-center font-bold text-mute">
          <span className="mb-1.5 block text-[54px]">🔥</span>
          Belum ada kegiatan.<br />Tambah satu, lalu jaga apinya tiap hari.
        </div>
      ) : (
        habits.map((h) => (
          <HabitCard
            key={h.id}
            habit={h}
            onToggle={() => onToggle(h)}
            onCalendar={() => setDetailId(h.id)}
            onDelete={() => setDelTarget(h)}
          />
        ))
      )}

      <NewHabitSheet
        open={!!adding}
        onClose={closeAdd}
        onCreate={(name, icon) => add.mutate({ name, icon })}
      />
      <DetailSheet habit={habits.find((h) => h.id === detailId) ?? null} onClose={() => setDetailId(null)} />
      <ConfirmSheet
        open={!!delTarget}
        title="Hapus kegiatan?"
        text={delTarget ? `"${delTarget.name}" beserta seluruh riwayatnya akan hilang.` : ''}
        onConfirm={() => delTarget && del.mutate(delTarget.id)}
        onClose={() => setDelTarget(null)}
      />
    </>
  )
}
