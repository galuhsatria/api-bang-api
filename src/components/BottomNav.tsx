import { Link } from '@tanstack/react-router'
import { Flame, Plus, Settings } from 'lucide-react'

const item = 'flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-extrabold'

export function BottomNav() {
  return (
    <nav
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="pointer-events-auto flex w-full max-w-90 items-center rounded-full border-2 border-b-[5px] border-line bg-card px-3 py-1.5 shadow-[0_10px_30px_rgba(31,27,58,.18)]">
        <Link
          to="/"
          activeOptions={{ exact: true, includeSearch: false }}
          className={item}
          activeProps={{ className: 'text-fire' }}
          inactiveProps={{ className: 'text-mute' }}
        >
          <Flame size={22} strokeWidth={2.5} />
          Streak
        </Link>

        <Link
          to="/"
          search={{ new: true }}
          aria-label="Kegiatan baru"
          title="Kegiatan baru"
          className="btn btn-fire mx-3 size-14 flex-none -translate-y-4 rounded-full p-0 ring-[5px] ring-bg"
        >
          <Plus size={28} strokeWidth={3.5} />
        </Link>

        <Link
          to="/settings"
          className={item}
          activeProps={{ className: 'text-fire' }}
          inactiveProps={{ className: 'text-mute' }}
        >
          <Settings size={22} strokeWidth={2.5} />
          Pengaturan
        </Link>
      </div>
    </nav>
  )
}
