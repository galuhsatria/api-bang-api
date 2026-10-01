import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BellOff, Download, Eye, EyeOff, ListOrdered, LogOut, Play, Shuffle, Smartphone, Square, Trash2, Upload, Volume2, VolumeX } from 'lucide-react'
import { ConfirmSheet } from '#/components/ConfirmSheet'
import { toast } from '#/components/Toaster'
import { disablePush, enablePush, pushState } from '#/lib/push'
import {
  MAX_SOUND_BYTES, useDeleteSound, useHideSound, useSettings, useSounds, useUpdateSettings, useUploadSounds,
  type SoundKind, type SoundRow,
} from '#/lib/queries'
import { playRow, stopSound, usePlayingPath } from '#/lib/sounds'
import { supabase } from '#/lib/supabase'

export const Route = createFileRoute('/_app/settings')({ component: SettingsPage })

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-3.5 rounded-[22px] border-2 border-b-[5px] border-line bg-card p-4">
      <h2 className="mb-3 text-lg font-black">{title}</h2>
      {children}
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="font-extrabold">{label}</p>
        {hint && <p className="text-[13px] font-bold text-mute">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-8 w-14 flex-none rounded-full border-2 transition-colors ${on ? 'border-mintd bg-mint' : 'border-line bg-empty'}`}
    >
      <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${on ? 'left-6.5' : 'left-0.5'}`} />
    </button>
  )
}

function SoundList({ kind, title }: { kind: SoundKind; title: string }) {
  const { data: all = [] } = useSounds()
  const upload = useUploadSounds()
  const hide = useHideSound()
  const del = useDeleteSound()
  const playing = usePlayingPath()
  const input = useRef<HTMLInputElement>(null)
  const [target, setTarget] = useState<SoundRow | null>(null)
  const rows = all.filter((r) => r.kind === kind)

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    const errors = await upload.mutateAsync({ kind, files: [...files] })
    if (input.current) input.current.value = ''
    toast(errors.length ? errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} lainnya)` : '') : 'Suara ditambahkan')
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-extrabold">{title}</p>
        <button className="btn btn-sm btn-ghost" disabled={upload.isPending} onClick={() => input.current?.click()}>
          <Upload size={15} strokeWidth={2.5} />{upload.isPending ? 'Mengunggah…' : 'Upload'}
        </button>
        <input ref={input} type="file" accept="audio/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </div>
      {rows.length === 0 ? (
        <p className="rounded-[14px] bg-bg p-3 text-[13px] font-bold text-mute">
          Belum ada suara. Upload beberapa file audio (maks {MAX_SOUND_BYTES / 1024 / 1024} MB per file).
        </p>
      ) : (
        <ul className="grid gap-2">
          {rows.map((r) => {
            const isPlaying = playing === r.path
            return (
              <li key={r.id} className={`flex items-center gap-2 rounded-[14px] bg-bg p-2 pl-3 ${r.hidden ? 'opacity-55' : ''}`}>
                <span className="min-w-0 flex-1 truncate font-bold">{r.name}{r.hidden && <em className="ml-1.5 text-xs text-mute not-italic">(disembunyikan)</em>}</span>
                <button
                  className={`btn btn-sm ${isPlaying ? 'btn-fire' : 'btn-ghost'}`}
                  aria-label={isPlaying ? `Stop ${r.name}` : `Putar ${r.name}`}
                  aria-pressed={isPlaying}
                  onClick={() => (isPlaying ? stopSound() : playRow(r))}
                >
                  {isPlaying ? <Square size={15} strokeWidth={3} fill="currentColor" /> : <Play size={15} strokeWidth={2.5} />}
                </button>
                <button className="btn btn-sm btn-ghost" aria-label={r.hidden ? `Tampilkan ${r.name}` : `Sembunyikan ${r.name}`} onClick={() => hide.mutate({ id: r.id, hidden: !r.hidden })}>
                  {r.hidden ? <EyeOff size={15} strokeWidth={2.5} /> : <Eye size={15} strokeWidth={2.5} />}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  aria-label={`Hapus ${r.name}`}
                  onClick={() => { if (isPlaying) stopSound(); setTarget(r) }}
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <ConfirmSheet
        open={!!target}
        title="Hapus suara?"
        text={target ? `"${target.name}" akan dihapus permanen. Kalau cuma mau berhenti dipakai, sembunyikan saja.` : ''}
        onConfirm={() => target && del.mutate(target)}
        onClose={() => setTarget(null)}
      />
    </div>
  )
}

function Avatar({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    return (
      <img
        src={url}
        alt={`Foto profil ${name}`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="size-14 flex-none rounded-full border-2 border-line object-cover"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-14 flex-none place-items-center rounded-full border-2 border-line bg-bg text-xl font-black text-fire"
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  )
}

function SettingsPage() {
  const { user } = useRouteContext({ from: '/_app' })
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>
  const displayName = meta.full_name ?? meta.name ?? user.email ?? 'Akun Google'
  const avatarUrl = meta.avatar_url ?? meta.picture
  const { data: s } = useSettings()
  const update = useUpdateSettings()
  const [push, setPush] = useState<'loading' | 'on' | 'off' | 'denied' | 'unsupported'>('loading')
  const [installEvt, setInstallEvt] = useState<any>(null)
  const [standalone, setStandalone] = useState(false)
  const ios = typeof navigator !== 'undefined' && /iphone|ipad/i.test(navigator.userAgent)

  useEffect(() => {
    void pushState().then(setPush)
    setStandalone(matchMedia('(display-mode: standalone)').matches)
    const h = (e: Event) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  useEffect(() => stopSound, [])

  async function toggleReminder(v: boolean) {
    if (v) {
      const r = await enablePush()
      if (r !== 'ok') {
        toast(r === 'denied' ? 'Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.' : r === 'unsupported' ? 'Browser ini belum mendukung push' : 'Gagal mengaktifkan, coba lagi')
        setPush(await pushState())
        return
      }
    } else {
      await disablePush()
    }
    update.mutate({ reminder_enabled: v })
    setPush(await pushState())
  }

  async function install() {
    if (!installEvt) return
    await installEvt.prompt()
    setInstallEvt(null)
  }

  if (!s) return <p className="py-9 text-center font-bold text-mute">Memuat…</p>

  return (
    <>
      <h1 className="mt-2 mb-4 text-[28px] font-black">Pengaturan</h1>

      <Section title="Akun">
        <div className="flex items-center gap-3">
          <Avatar url={avatarUrl} name={displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-extrabold">{displayName}</p>
            {user.email && <p className="truncate text-[13px] font-bold text-mute">{user.email}</p>}
          </div>
        </div>
        <button className="btn btn-danger mt-4 w-full" onClick={() => supabase.auth.signOut()}>
          <LogOut size={18} strokeWidth={2.5} />Keluar
        </button>
      </Section>

      <Section title="Pengingat">
        <Row label="Ingatkan kalau belum selesai" hint={push === 'denied' ? 'Izin notifikasi diblokir di browser' : push === 'unsupported' ? 'Browser ini belum mendukung push' : 'Notifikasi dikirim sekali sehari'}>
          <Switch on={s.reminder_enabled && push === 'on'} onChange={toggleReminder} label="Pengingat" />
        </Row>
        <Row label="Jam pengingat" hint={`Zona waktu ${s.timezone}`}>
          <input
            type="time"
            value={s.reminder_time.slice(0, 5)}
            onChange={(e) => e.target.value && update.mutate({ reminder_time: e.target.value })}
            className="rounded-[14px] border-2 border-line bg-bg px-3 py-2 font-extrabold"
          />
        </Row>
        {ios && !standalone && (
          <p className="mt-1 flex gap-2 rounded-[14px] bg-bg p-3 text-[13px] font-bold text-mute">
            <BellOff size={16} className="mt-0.5 flex-none" />Di iPhone, push hanya jalan setelah app ditambahkan ke layar utama (Share → Add to Home Screen).
          </p>
        )}
      </Section>

      <Section title="Suara">
        <Row label="Bisukan semua suara" hint="Berlaku untuk ceklis dan milestone">
          <button className={`btn btn-sm ${s.muted ? 'btn-danger' : 'btn-ghost'}`} aria-pressed={s.muted} onClick={() => update.mutate({ muted: !s.muted })}>
            {s.muted ? <><VolumeX size={16} strokeWidth={2.5} />Bisu</> : <><Volume2 size={16} strokeWidth={2.5} />Nyala</>}
          </button>
        </Row>
        <Row label="Urutan putar" hint="Dipakai saat ada lebih dari satu suara">
          <div className="flex gap-2">
            <button className={`btn btn-sm ${s.sound_mode === 'random' ? 'btn-fire' : 'btn-ghost'}`} aria-pressed={s.sound_mode === 'random'} onClick={() => update.mutate({ sound_mode: 'random' })}>
              <Shuffle size={15} strokeWidth={2.5} />Acak
            </button>
            <button className={`btn btn-sm ${s.sound_mode === 'sequential' ? 'btn-fire' : 'btn-ghost'}`} aria-pressed={s.sound_mode === 'sequential'} onClick={() => update.mutate({ sound_mode: 'sequential' })}>
              <ListOrdered size={15} strokeWidth={2.5} />Berurutan
            </button>
          </div>
        </Row>
        <SoundList kind="check" title="Suara ceklis" />
        <SoundList kind="milestone" title="Suara milestone" />
      </Section>

      <Section title="Layar utama">
        <p className="mb-3 flex gap-2 text-[13px] font-bold text-mute">
          <Smartphone size={16} className="mt-0.5 flex-none" />
          Widget web belum bisa dipasang di layar utama Android/iPhone. Sebagai gantinya, tambahkan app ini ke layar utama; pesan semangatnya tampil lewat notifikasi dan kartu di halaman Streak.
        </p>
        {standalone ? (
          <p className="font-extrabold text-mint">Sudah terpasang di layar utama ✓</p>
        ) : installEvt ? (
          <button className="btn btn-fire" onClick={install}><Download size={18} strokeWidth={2.5} />Tambah ke layar utama</button>
        ) : (
          <p className="text-[13px] font-bold text-mute">{ios ? 'Buka menu Share lalu pilih Add to Home Screen.' : 'Buka menu browser lalu pilih Install app / Add to Home screen.'}</p>
        )}
      </Section>
    </>
  )
}
