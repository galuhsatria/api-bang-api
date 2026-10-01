import { useEffect, type ReactNode } from 'react'

export function Sheet({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(20,16,40,.55)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-label={label}
        className="max-h-[92vh] w-full max-w-130 overflow-y-auto rounded-t-[26px] bg-card px-4.5 pt-5.5 pb-[calc(22px+env(safe-area-inset-bottom,0px))] scrollbar-none"
      >
        {children}
      </div>
    </div>
  )
}
