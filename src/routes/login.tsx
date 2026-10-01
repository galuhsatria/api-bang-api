import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Flame } from '#/components/Flame'
import { supabase } from '#/lib/supabase'

export const Route = createFileRoute('/login')({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) throw redirect({ to: '/' })
  },
  component: Login,
})

function Login() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function google() {
    setBusy(true)
    setErr('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) { setErr(error.message); setBusy(false) }
  }

  return (
    <main className="mx-auto flex min-h-[80dvh] max-w-105 flex-col items-center justify-center px-6 text-center">
      <Flame className="mb-4 size-28 drop-shadow-[0_6px_10px_rgba(255,122,26,.35)]" />
      <h1 className="text-3xl font-black">API BANG API</h1>
      <p className="mt-1 mb-8 font-bold text-mute">Jaga apinya tiap hari. Masuk dulu biar streak-mu aman di semua perangkat.</p>
      <button className="btn btn-ghost w-full py-3.5 text-base" onClick={google} disabled={busy}>
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
          <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
        </svg>
        {busy ? 'Membuka Google…' : 'Masuk dengan Google'}
      </button>
      {err && <p className="mt-4 text-sm font-bold text-danger">{err}</p>}
    </main>
  )
}
