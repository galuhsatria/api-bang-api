import { lazy, Suspense } from 'react'

export const PRESET_ICONS = ['📚', '🏃', '💧', '🧘', '✍️', '🎸', '💪', '🥗', '😴', '🧹', '💻', '🌱', '🙏', '🎨', '🗣️', '💰', '🚭', '🦷', '☕', '📖', '🧠', '🚴', '🛏️', '🍎']

export const randomIcon = () => PRESET_ICONS[Math.floor(Math.random() * PRESET_ICONS.length)]

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export function IconPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <Suspense fallback={<div className="py-10 text-center text-mute">Memuat ikon…</div>}>
      <EmojiPicker
        width="100%"
        height={340}
        lazyLoadEmojis
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
        searchPlaceHolder="Cari ikon"
        onEmojiClick={(d) => onPick(d.emoji)}
      />
    </Suspense>
  )
}
