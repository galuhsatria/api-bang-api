import { Keyboard } from 'lucide-react'

export const PRESET_ICONS = ['📚', '🏃', '💧', '🧘', '✍️', '🎸', '💪', '🥗', '😴', '🧹', '💻', '🌱', '🙏', '🎨', '🗣️', '💰', '🚭', '🦷', '☕', '📖', '🧠', '🚴', '🛏️', '🍎']

const seg = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' }) : null

export function firstGrapheme(s: string) {
  const t = s.trim()
  if (!t) return ''
  if (seg) for (const x of seg.segment(t)) return x.segment as string
  return Array.from(t)[0]
}

export function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const custom = !PRESET_ICONS.includes(value)
  return (
    <div className="my-3.5">
      <div className="mb-3 flex flex-wrap gap-2">
        {custom && (
          <button type="button" aria-label={`Ikon ${value}`} className="icon-opt sel" onClick={() => onChange(value)}>{value}</button>
        )}
        {PRESET_ICONS.map((x) => (
          <button key={x} type="button" aria-label={`Ikon ${x}`} className={`icon-opt ${x === value ? 'sel' : ''}`} onClick={() => onChange(x)}>{x}</button>
        ))}
      </div>
      <label className="flex items-center gap-2 rounded-[14px] border-2 border-line bg-bg px-3 focus-within:border-sun focus-within:outline-3 focus-within:outline-sun">
        <Keyboard size={18} className="flex-none text-mute" />
        <input
          value={custom ? value : ''}
          onChange={(e) => { const g = firstGrapheme(e.target.value); if (g) onChange(g) }}
          placeholder="Atau ketik emoji / simbol dari keyboard"
          aria-label="Ikon dari keyboard"
          className="w-full min-w-0 bg-transparent py-3 text-[15px] font-bold outline-none"
        />
      </label>
    </div>
  )
}
