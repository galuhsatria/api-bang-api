import { useEffect, useState } from 'react'

export const toast = (m: string) => window.dispatchEvent(new CustomEvent('toast', { detail: m }))

export function Toaster() {
  const [msg, setMsg] = useState('')
  const [show, setShow] = useState(false)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const h = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail)
      setShow(true)
      clearTimeout(t)
      t = setTimeout(() => setShow(false), 2400)
    }
    window.addEventListener('toast', h)
    return () => { window.removeEventListener('toast', h); clearTimeout(t) }
  }, [])
  return (
    <div
      role="status"
      className={`pointer-events-none fixed left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-center font-black text-bg transition-transform duration-300 motion-reduce:transition-none ${show ? 'translate-y-0' : '-translate-y-24'}`}
      style={{ top: 'calc(16px + env(safe-area-inset-top, 0px))' }}
    >
      {msg}
    </div>
  )
}
