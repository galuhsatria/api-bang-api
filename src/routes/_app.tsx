import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BottomNav } from '#/components/BottomNav'
import { Toaster } from '#/components/Toaster'
import { registerSW } from '#/lib/push'
import { supabase } from '#/lib/supabase'

export const Route = createFileRoute('/_app')({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/login' })
    return { user: data.session.user }
  },
  component: AppLayout,
})

function AppLayout() {
  const [qc] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }))
  const nav = useNavigate()

  useEffect(() => {
    void registerSW()
    const { data } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === 'SIGNED_OUT') { qc.clear(); void nav({ to: '/login' }) }
    })
    return () => data.subscription.unsubscribe()
  }, [qc, nav])

  return (
    <QueryClientProvider client={qc}>
      <main className="mx-auto max-w-130 px-4 pt-5 pb-[calc(110px+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster />
    </QueryClientProvider>
  )
}
