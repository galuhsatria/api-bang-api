import { useEffect, useState } from 'react'
import { Flame, X, Shuffle, Pencil, ChevronLeft } from 'lucide-react'
import { Sheet } from '#/components/Sheet'
import { IconPicker, PRESET_ICONS, randomIcon } from '#/components/IconPicker'

export function NewHabitSheet({ open, onClose, onCreate }: {
  open: boolean; onClose: () => void; onCreate: (name: string, icon: string) => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [view, setView] = useState<'form' | 'icons'>('form')

  useEffect(() => {
    if (open) { setName(''); setIcon(randomIcon()); setView('form') }
  }, [open])

  const canSubmit = name.trim().length > 0
  const submit = () => {
    if (!canSubmit) return
    onCreate(name.trim(), icon)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} label="Kegiatan baru">
      {view === 'icons' ? (
        <div>
          <button type="button" className="mb-3 flex items-center gap-1 font-black" onClick={() => setView('form')}>
            <ChevronLeft size={20} strokeWidth={3} /> Pilih ikon
          </button>
          <IconPicker onPick={(e) => { setIcon(e); setView('form') }} />
        </div>
      ) : (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="-mx-1.5 overflow-y-auto px-1.5 py-1.5">
            <h2 className="mb-4 text-[22px] font-black">Mau rutin ngapain?</h2>

            <div className="mb-6 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setView('icons')}
                aria-label="Ganti ikon"
                className="relative grid h-20 w-20 place-items-center rounded-[20px] border-2 border-line bg-bg text-[40px]! leading-none active:scale-95"
              >
                {icon}
                <span className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-sun text-white">
                  <Pencil size={14} strokeWidth={3} />
                </span>
              </button>
              <button type="button" className="flex mt-2 items-center gap-1.5 text-sm font-bold text-mute" onClick={() => setIcon(randomIcon())}>
                <Shuffle size={16} strokeWidth={2.5} /> Acak
              </button>
            </div>

            <input
              value={name}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              enterKeyHint="done"
              placeholder="Contoh: Baca 10 halaman"
              autoComplete="off"
              className="w-full rounded-[14px] border-2 border-line bg-bg p-3.5 text-[17px] font-bold focus:border-sun focus:outline-2 focus:outline-sun"
            />
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] gap-3 pb-[env(safe-area-inset-bottom)]">
            <button className="btn btn-fire disabled:pointer-events-none disabled:opacity-40" disabled={!canSubmit} onClick={submit}>
              <Flame size={20} strokeWidth={2.5} />Mulai streak
            </button>
            <button className="btn btn-ghost" onClick={onClose}><X size={18} strokeWidth={3} />Batal</button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
