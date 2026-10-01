export type Slot = 'dini' | 'pagi' | 'siang' | 'sore' | 'malam'
export type WidgetState = 'greet' | 'nudge' | 'done' | 'frozen' | 'empty'

export const SLOT_START: Record<Slot, number> = { dini: 0, pagi: 5, siang: 11, sore: 15, malam: 18 }
export const SLOT_ICON: Record<Slot, string> = { dini: '🌌', pagi: '🌅', siang: '☀️', sore: '🌇', malam: '🌙' }

export function slotOf(d = new Date()): Slot {
  const h = d.getHours()
  return h < 5 ? 'dini' : h < 11 ? 'pagi' : h < 15 ? 'siang' : h < 18 ? 'sore' : 'malam'
}

const GREET: Record<Slot, string[]> = {
  dini: ['Bobo dulu', 'Tidur, bestie'],
  pagi: ['Pagi, bestie!', 'Pagi, gas!'],
  siang: ['Siang, gas!', 'Lunch dulu'],
  sore: ['Sore, lanjut!', 'Sore santuy'],
  malam: ['Malam, gas!', 'Tutup hari'],
}
const NUDGE = ['Yuk lanjut!', 'Jangan mager', 'Tinggal klik', 'Anti bolos', 'Sat set yuk', 'Jangan putus', 'Dikit lagi', 'Belum lho']
const DONE = ['Mantap!', 'Keren abis', 'Aman, bestie', 'Streak aman']
const FROZEN = ['Bangkit yuk', 'Reset, gas!', 'Es-nya cair!']
const EMPTY = ['Mulai yuk!', 'Gas mulai']

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function widgetMessage(state: WidgetState, slot: Slot, seed: string) {
  const list = state === 'greet' ? GREET[slot] : state === 'done' ? DONE : state === 'frozen' ? FROZEN : state === 'empty' ? EMPTY : NUDGE
  return list[hash(seed) % list.length]
}
