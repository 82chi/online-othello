import type { Board, CellValue, PlayerColor, GameState, GameEndReason } from '~/types/game'

const BOARD_SIZE = 8

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

export function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null),
  )
  board[3][3] = 'white'
  board[3][4] = 'black'
  board[4][3] = 'black'
  board[4][4] = 'white'
  return board
}

export function getFlippable(board: Board, row: number, col: number, color: PlayerColor): [number, number][] {
  if (board[row][col] !== null) return []
  const opponent: CellValue = color === 'black' ? 'white' : 'black'
  const toFlip: [number, number][] = []

  for (const [dr, dc] of DIRECTIONS) {
    const line: [number, number][] = []
    let r = row + dr
    let c = col + dc
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent) {
      line.push([r, c])
      r += dr
      c += dc
    }
    if (line.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === color) {
      toFlip.push(...line)
    }
  }

  return toFlip
}

export function getValidMoves(board: Board, color: PlayerColor): [number, number][] {
  const moves: [number, number][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (getFlippable(board, r, c, color).length > 0) {
        moves.push([r, c])
      }
    }
  }
  return moves
}

export function applyMove(board: Board, row: number, col: number, color: PlayerColor): Board {
  const flippable = getFlippable(board, row, col, color)
  if (flippable.length === 0) return board

  const newBoard: Board = board.map(row => [...row])
  newBoard[row][col] = color
  for (const [r, c] of flippable) {
    newBoard[r][c] = color
  }
  return newBoard
}

export function countPieces(board: Board): { black: number; white: number } {
  let black = 0
  let white = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++
      else if (cell === 'white') white++
    }
  }
  return { black, white }
}

export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null))
}

export function checkGameEnd(board: Board, passCount: number): { finished: boolean; reason: GameEndReason } {
  const { black, white } = countPieces(board)

  if (black === 0 || white === 0) {
    return { finished: true, reason: 'annihilated' }
  }

  if (isBoardFull(board)) {
    return { finished: true, reason: 'full' }
  }

  if (passCount >= 2) {
    return { finished: true, reason: 'bothPass' }
  }

  return { finished: false, reason: null }
}

export function determineWinner(board: Board): 'black' | 'white' | 'draw' {
  const { black, white } = countPieces(board)
  if (black > white) return 'black'
  if (white > black) return 'white'
  return 'draw'
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: 'black',
    players: [],
    status: 'waiting',
    winner: null,
    passCount: 0,
    endReason: null,
  }
}

export function processMove(state: GameState, row: number, col: number, playerId: string): GameState {
  if (state.status !== 'playing') return state

  const player = state.players.find(p => p.id === playerId)
  if (!player || player.color !== state.currentPlayer) return state

  const flippable = getFlippable(state.board, row, col, state.currentPlayer)
  if (flippable.length === 0) return state

  const newBoard = applyMove(state.board, row, col, state.currentPlayer)
  const nextPlayer: PlayerColor = state.currentPlayer === 'black' ? 'white' : 'black'

  // Check for game end after move
  const { black, white } = countPieces(newBoard)
  if (black === 0 || white === 0) {
    return {
      ...state,
      board: newBoard,
      status: 'finished',
      winner: determineWinner(newBoard),
      endReason: 'annihilated',
      passCount: 0,
    }
  }

  if (isBoardFull(newBoard)) {
    return {
      ...state,
      board: newBoard,
      status: 'finished',
      winner: determineWinner(newBoard),
      endReason: 'full',
      passCount: 0,
    }
  }

  // Check if next player can move
  const nextMoves = getValidMoves(newBoard, nextPlayer)
  if (nextMoves.length > 0) {
    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      passCount: 0,
    }
  }

  // Next player must pass - check if current player can also move
  const currentMoves = getValidMoves(newBoard, state.currentPlayer)
  if (currentMoves.length > 0) {
    // Only next player passes, current player can still move
    return {
      ...state,
      board: newBoard,
      currentPlayer: state.currentPlayer,
      passCount: state.passCount + 1,
    }
  }

  // Both players have no moves -> game over
  return {
    ...state,
    board: newBoard,
    status: 'finished',
    winner: determineWinner(newBoard),
    endReason: 'bothPass',
    passCount: state.passCount + 2,
  }
}

export function useOthello() {
  const board = ref<Board>(createInitialBoard())
  const currentPlayer = ref<PlayerColor>('black')
  const validMoves = ref<[number, number][]>([])

  const blackCount = computed(() => countPieces(board.value).black)
  const whiteCount = computed(() => countPieces(board.value).white)

  function updateValidMoves() {
    validMoves.value = getValidMoves(board.value, currentPlayer.value)
  }

  function isValidMove(row: number, col: number): boolean {
    return validMoves.value.some(([r, c]) => r === row && c === col)
  }

  function syncFromState(state: GameState) {
    board.value = state.board
    currentPlayer.value = state.currentPlayer
    updateValidMoves()
  }

  updateValidMoves()

  return {
    board,
    currentPlayer,
    validMoves,
    blackCount,
    whiteCount,
    isValidMove,
    syncFromState,
    updateValidMoves,
  }
}
