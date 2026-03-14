export function useWinLoss() {
  const wins = useState('wins', () => {
    if (import.meta.client) {
      return parseInt(sessionStorage.getItem('wins') ?? '0', 10)
    }
    return 0
  })

  const losses = useState('losses', () => {
    if (import.meta.client) {
      return parseInt(sessionStorage.getItem('losses') ?? '0', 10)
    }
    return 0
  })

  function addWin() {
    wins.value++
    if (import.meta.client) {
      sessionStorage.setItem('wins', String(wins.value))
    }
  }

  function addLoss() {
    losses.value++
    if (import.meta.client) {
      sessionStorage.setItem('losses', String(losses.value))
    }
  }

  return { wins, losses, addWin, addLoss }
}
