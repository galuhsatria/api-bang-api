import { supabase } from '#/lib/supabase'

const KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function toU8(b64: string) {
  const p = '='.repeat((4 - (b64.length % 4)) % 4)
  const s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

export async function registerSW() {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('/sw.js') } catch {  }
  }
}

export async function pushState(): Promise<'on' | 'off' | 'denied' | 'unsupported'> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  return sub && Notification.permission === 'granted' ? 'on' : 'off'
}

export async function enablePush(): Promise<'ok' | 'denied' | 'unsupported' | 'error'> {
  if (!pushSupported()) return 'unsupported'
  if ((await Notification.requestPermission()) !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toU8(KEY) as BufferSource }))
    const j = sub.toJSON()
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ endpoint: j.endpoint!, p256dh: j.keys!.p256dh, auth: j.keys!.auth }, { onConflict: 'endpoint' })
    return error ? 'error' : 'ok'
  } catch {
    return 'error'
  }
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    await sub.unsubscribe()
  }
}
