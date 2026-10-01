import { Trash2, X } from 'lucide-react'
import { Sheet } from '#/components/Sheet'

export function ConfirmSheet({ open, title, text, confirmLabel = 'Hapus', onConfirm, onClose }: {
  open: boolean; title: string; text: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} label={title}>
      <h2 className="mb-2 text-[22px] font-black">{title}</h2>
      <p className="mb-5 font-bold text-mute">{text}</p>
      <div className="grid grid-cols-2 gap-3">
        <button className="btn btn-ghost" onClick={onClose}><X size={18} strokeWidth={3} />Batal</button>
        <button className="btn btn-danger-solid" onClick={() => { onConfirm(); onClose() }}><Trash2 size={18} strokeWidth={2.5} />{confirmLabel}</button>
      </div>
    </Sheet>
  )
}
