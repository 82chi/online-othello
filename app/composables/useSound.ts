export function useSound() {
  let audioCtx: AudioContext | null = null

  function getCtx(): AudioContext | null {
    if (!import.meta.client) return null
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
  }

  function playPieceSound() {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

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

  return { playPieceSound }
}
