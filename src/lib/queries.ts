import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase'
import { forget } from '#/lib/sounds'

export type SoundKind = 'check' | 'milestone'
export type SoundMode = 'random' | 'sequential'
export type Habit = { id: string; name: string; icon: string; created_at: string; days: string[] }
export type Settings = {
  user_id: string
  muted: boolean
  sound_mode: SoundMode
  reminder_time: string
  reminder_enabled: boolean
  timezone: string
}
export type SoundRow = { id: string; kind: SoundKind; path: string; name: string; hidden: boolean; created_at: string }

export const MAX_SOUND_BYTES = 2 * 1024 * 1024

// ---------- habits ----------
export const useHabits = () =>
  useQuery({
    queryKey: ['habits'],
    queryFn: async (): Promise<Habit[]> => {
      const { data, error } = await supabase
        .from('habits')
        .select('id,name,icon,created_at,checkins(day)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((h: any) => ({
        id: h.id, name: h.name, icon: h.icon, created_at: h.created_at,
        days: (h.checkins ?? []).map((c: { day: string }) => c.day),
      }))
    },
  })

export function useToggle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (v: { habit: string; day: string; on: boolean }) => {
      const { error } = v.on
        ? await supabase.from('checkins').delete().eq('habit_id', v.habit).eq('day', v.day)
        : await supabase.from('checkins').insert({ habit_id: v.habit, day: v.day })
      if (error) throw error
    },
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ['habits'] })
      const prev = qc.getQueryData<Habit[]>(['habits'])
      qc.setQueryData<Habit[]>(['habits'], (hs = []) =>
        hs.map((h) => (h.id !== v.habit ? h : { ...h, days: v.on ? h.days.filter((d) => d !== v.day) : [...h.days, v.day] })),
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['habits'], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useAddHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (v: { name: string; icon: string }) => {
      const { error } = await supabase.from('habits').insert(v)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: (id) => qc.setQueryData<Habit[]>(['habits'], (hs = []) => hs.filter((h) => h.id !== id)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

// ---------- settings ----------
export const useSettings = () =>
  useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase.from('settings').select('*').maybeSingle()
      if (error) throw error
      if (data) return data as Settings
      const { data: created, error: e2 } = await supabase
        .from('settings')
        .insert({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
        .select()
        .single()
      if (e2) throw e2
      return created as Settings
    },
  })

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<Omit<Settings, 'user_id'>>) => {
      const cur = qc.getQueryData<Settings>(['settings'])
      if (!cur) throw new Error('pengaturan belum dimuat')
      const { error } = await supabase.from('settings').update(patch).eq('user_id', cur.user_id)
      if (error) throw error
    },
    onMutate: (patch) => { qc.setQueryData<Settings>(['settings'], (s) => (s ? { ...s, ...patch } : s)) },
    onError: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

/** jaga zona waktu di DB sama dengan perangkat (dipakai untuk jam push) */
export function useSyncTimezone() {
  const { data } = useSettings()
  const update = useUpdateSettings()
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (data && tz && data.timezone !== tz) update.mutate({ timezone: tz })
  }, [data?.timezone]) // eslint-disable-line react-hooks/exhaustive-deps
}

// ---------- sounds ----------
export const useSounds = () =>
  useQuery({
    queryKey: ['sounds'],
    queryFn: async (): Promise<SoundRow[]> => {
      const { data, error } = await supabase.from('sounds').select('*').order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as SoundRow[]
    },
  })

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|opus|flac|webm)$/i

export function useUploadSounds() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ kind, files }: { kind: SoundKind; files: File[] }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session!.user.id
      const errors: string[] = []
      for (const f of files) {
        const isAudio = f.type.startsWith('audio/') || AUDIO_EXT.test(f.name)
        if (!isAudio) { errors.push(`${f.name}: bukan file audio`); continue }
        if (f.size > MAX_SOUND_BYTES) { errors.push(`${f.name}: lebih dari 2 MB`); continue }
        const ext = (f.name.split('.').pop() || 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '')
        const path = `${uid}/${kind}/${crypto.randomUUID()}.${ext}`
        const up = await supabase.storage.from('sounds').upload(path, f, {
          contentType: f.type.startsWith('audio/') ? f.type : 'audio/mpeg',
        })
        if (up.error) { errors.push(`${f.name}: ${up.error.message}`); continue }
        const ins = await supabase.from('sounds').insert({ kind, path, name: f.name.replace(/\.[^.]+$/, '') })
        if (ins.error) {
          await supabase.storage.from('sounds').remove([path])
          errors.push(`${f.name}: ${ins.error.message}`)
        }
      }
      return errors
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sounds'] }),
  })
}

export function useHideSound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (v: { id: string; hidden: boolean }) => {
      const { error } = await supabase.from('sounds').update({ hidden: v.hidden }).eq('id', v.id)
      if (error) throw error
    },
    onMutate: (v) =>
      qc.setQueryData<SoundRow[]>(['sounds'], (rs = []) => rs.map((r) => (r.id === v.id ? { ...r, hidden: v.hidden } : r))),
    onSettled: () => qc.invalidateQueries({ queryKey: ['sounds'] }),
  })
}

export function useDeleteSound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (r: SoundRow) => {
      const rm = await supabase.storage.from('sounds').remove([r.path])
      if (rm.error) throw rm.error
      const { error } = await supabase.from('sounds').delete().eq('id', r.id)
      if (error) throw error
      forget(r.path)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sounds'] }),
  })
}
