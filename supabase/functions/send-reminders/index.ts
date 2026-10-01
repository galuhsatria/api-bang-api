import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const NUDGES = ['Yuk lanjut!', 'Jangan mager', 'Tinggal klik', 'Anti bolos', 'Sat set yuk', 'Jangan putus', 'Dikit lagi', 'Belum lho']
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('forbidden', { status: 403 })

  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: rows, error } = await sb
    .from('settings')
    .select('user_id,reminder_time,timezone,last_push_day')
    .eq('reminder_enabled', true)
  if (error) return new Response(error.message, { status: 500 })

  let sent = 0
  for (const s of rows ?? []) {
    try {
      // jam & tanggal lokal user
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: s.timezone, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      }).formatToParts(new Date())
      const p = Object.fromEntries(parts.map((x) => [x.type, x.value]))
      const today = `${p.year}-${p.month}-${p.day}`
      const now = +p.hour * 60 + +p.minute
      const [h, m] = String(s.reminder_time).split(':').map(Number)
      const at = h * 60 + m
      // kirim sekali per hari, dalam jendela 2 jam setelah jam pengingat
      if (now < at || now > at + 120 || s.last_push_day === today) continue

      const { data: habits } = await sb.from('habits').select('id,name,icon').eq('user_id', s.user_id)
      if (!habits?.length) continue
      const { data: done } = await sb.from('checkins').select('habit_id').eq('user_id', s.user_id).eq('day', today)
      const doneSet = new Set((done ?? []).map((d) => d.habit_id))
      const pending = habits.filter((x) => !doneSet.has(x.id))
      if (!pending.length) continue

      const { data: subs } = await sb.from('push_subscriptions').select('endpoint,p256dh,auth').eq('user_id', s.user_id)
      if (!subs?.length) continue

      const payload = JSON.stringify({
        title: pick(NUDGES),
        body: pending.map((x) => `${x.icon} ${x.name}`).join(', ').slice(0, 120),
        url: '/',
      })

      let ok = 0
      for (const sub of subs) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload)
          ok++
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode
          if (code === 404 || code === 410) await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
      if (ok) {
        sent += ok
        await sb.from('settings').update({ last_push_day: today }).eq('user_id', s.user_id)
      }
    } catch (e) {
      console.error('reminder gagal untuk', s.user_id, e)
    }
  }
  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
