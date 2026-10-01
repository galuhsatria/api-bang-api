import { useEffect, useState } from 'react'
import { Flame, X } from 'lucide-react'
import { Sheet } from '#/components/Sheet'
import { IconPicker, PRESET_ICONS } from '#/components/IconPicker'
import { toast } from '#/components/Toaster'

export function NewHabitSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (name: string, icon: string) => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  useEffect(() => { if (open) { setName(''); setIcon(PRESET_ICONS[0]) } }, [open])

  const submit = () => {
    const n = name.trim()
    if (!n) { toast('Isi nama kegiatannya dulu'); return }
    onCreate(n, icon)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} label="Kegiatan baru">
      <h2 className="mb-3.5 text-[22px] font-black">Mau rutin ngapain?</h2>
      <input
        autoFocus
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        placeholder="Contoh: Baca 10 halaman"
        autoComplete="off"
        className="w-full rounded-[14px] border-2 border-line bg-bg p-3.5 text-[17px] font-bold focus:border-sun focus:outline-3 focus:outline-sun"
      />
      <IconPicker value={icon} onChange={setIcon} />
      <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
        <button className="btn btn-fire" onClick={submit}><Flame size={20} strokeWidth={2.5} />Mulai streak</button>
        <button className="btn btn-ghost" onClick={onClose}><X size={18} strokeWidth={3} />Batal</button>
      </div>
    </Sheet>
  )
}
