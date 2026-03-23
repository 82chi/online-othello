import { ref } from 'vue'

let audioCtx: AudioContext | null = null

function getOrCreateCtx(): AudioContext | null {
  if (!import.meta.client) return null
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

const isMuted = ref(false)
let soundInitialized = false

export function useSound() {
  if (import.meta.client && !soundInitialized) {
    soundInitialized = true
    isMuted.value = sessionStorage.getItem('muted') === 'true'
  }

  async function playPieceSound() {
    if (isMuted.value) return
    const ctx = getOrCreateCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') await ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08)
    gain.gain.setValueAtTime(0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.start(now)
    osc.stop(now + 0.08)
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
    if (import.meta.client) {
      sessionStorage.setItem('muted', String(isMuted.value))
    }
  }

  return { playPieceSound, isMuted, toggleMute }
}
