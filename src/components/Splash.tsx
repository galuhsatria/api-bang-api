import { useEffect, useState } from 'react'

export function Splash() {
  const [hide, setHide] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 400)
    const t2 = setTimeout(() => setGone(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-200 grid place-items-center bg-bg transition-opacity duration-300 ${hide ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-3">
        <img src='./icon.svg' className='w-26 mb-4'/>
      </div>
    </div>
  )
}
