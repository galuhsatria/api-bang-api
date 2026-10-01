import { supabase } from '#/lib/supabase'
import type { SoundKind, SoundMode, SoundRow } from '#/lib/queries'
import { useSyncExternalStore } from 'react'

const urls = new Map<string, Promise<string>>()

function ensure(path: string) {
  let p = urls.get(path)
  if (!p) {
    p = supabase.storage.from('sounds').download(path).then(({ data, error }) => {
      if (error || !data) throw error ?? new Error('download gagal')
      return URL.createObjectURL(data)
    })
    p.catch(() => urls.delete(path))
    urls.set(path, p)
  }
  return p
}

export function prefetch(rows: SoundRow[]) {
  rows.filter((r) => !r.hidden).forEach((r) => { ensure(r.path).catch(() => {}) })
}
export const forget = (path: string) => urls.delete(path)


export async function playRow(r: SoundRow) {
  stopSound()
  playingPath = r.path
  emit()
  try {
    const url = await ensure(r.path)
    if (playingPath !== r.path) return
    const a = new Audio(url)
    current = a
    a.onended = a.onerror = () => { if (current === a) stopSound() }
    await a.play()
  } catch {
    if (playingPath === r.path) stopSound()
  }
}

const last: Partial<Record<SoundKind, string>> = {}

export function playSound(kind: SoundKind, rows: SoundRow[], mode: SoundMode, muted: boolean) {
  if (muted) return
  let k = kind
  let pool = rows.filter((r) => r.kind === k && !r.hidden)
  if (!pool.length && k === 'milestone') { k = 'check'; pool = rows.filter((r) => r.kind === 'check' && !r.hidden) }
  if (!pool.length) return

  let pick: SoundRow
  if (mode === 'sequential') {
    const key = `snd.${k}`
    const i = Number(localStorage.getItem(key) || 0) % pool.length
    localStorage.setItem(key, String(i + 1))
    pick = pool[i]
  } else {
    const cand = pool.length > 1 ? pool.filter((r) => r.path !== last[k]) : pool
    pick = cand[Math.floor(Math.random() * cand.length)]
  }
  last[k] = pick.path
  void playRow(pick)
}

let current: HTMLAudioElement | null = null
let playingPath: string | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function stopSound() {
  if (current) {
    current.onended = null
    current.onerror = null
    current.pause()
    current.currentTime = 0
    current = null
  }
  if (playingPath !== null) {
    playingPath = null
    emit()
  }
}

export function usePlayingPath() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l) } },
    () => playingPath,
    () => null,
  )
}
