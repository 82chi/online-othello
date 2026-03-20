import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  getFlippable,
  getValidMoves,
  applyMove,
  countPieces,
  isBoardFull,
  checkGameEnd,
  determineWinner,
  createInitialGameState,
  processMove,
} from './useOthello'
import type { Board, GameState } from '~/types/game'

// Helper: create an empty 8x8 board
function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null))
}

describe('createInitialBoard', () => {
  it('returns an 8x8 board', () => {
    const board = createInitialBoard()
    expect(board).toHaveLength(8)
    board.forEach(row => expect(row).toHaveLength(8))
  })

  it('places 2 black and 2 white pieces in the center', () => {
    const board = createInitialBoard()
    expect(board[3][3]).toBe('white')
    expect(board[3][4]).toBe('black')
    expect(board[4][3]).toBe('black')
    expect(board[4][4]).toBe('white')
  })

  it('all other cells are null', () => {
    const board = createInitialBoard()
    const nonNull = board.flat().filter(c => c !== null)
    expect(nonNull).toHaveLength(4)
  })
})

describe('getFlippable', () => {
  it('returns flippable pieces for a valid move', () => {
    const board = createInitialBoard()
    // black at (3,2) flips white at (3,3)
    const flippable = getFlippable(board, 3, 2, 'black')
    expect(flippable).toContainEqual([3, 3])
    expect(flippable).toHaveLength(1)
  })

  it('returns empty array for a cell that is already occupied', () => {
    const board = createInitialBoard()
    expect(getFlippable(board, 3, 3, 'black')).toHaveLength(0)
  })

  it('returns empty array when no pieces would be flipped', () => {
    const board = createInitialBoard()
    // corner (0,0) has no adjacent opponent pieces to sandwich
    expect(getFlippable(board, 0, 0, 'black')).toHaveLength(0)
  })
})

describe('getValidMoves', () => {
  it('black has exactly 4 valid moves at the start', () => {
    const board = createInitialBoard()
    const moves = getValidMoves(board, 'black')
    expect(moves).toHaveLength(4)
  })

  it('white has exactly 4 valid moves at the start', () => {
    const board = createInitialBoard()
    const moves = getValidMoves(board, 'white')
    expect(moves).toHaveLength(4)
  })

  it('returns no moves when color has no valid plays', () => {
    // board where black is completely surrounded
    const board = emptyBoard()
    board[0][0] = 'white'
    // no black pieces → no valid moves for white to flip
    const moves = getValidMoves(board, 'black')
    expect(moves).toHaveLength(0)
  })
})

describe('applyMove', () => {
  it('places a piece and flips opponent pieces', () => {
    const board = createInitialBoard()
    const newBoard = applyMove(board, 3, 2, 'black')
    expect(newBoard[3][2]).toBe('black')
    expect(newBoard[3][3]).toBe('black') // flipped
    // original board is not mutated
    expect(board[3][2]).toBeNull()
    expect(board[3][3]).toBe('white')
  })

  it('returns the same board reference when move is invalid', () => {
    const board = createInitialBoard()
    const result = applyMove(board, 0, 0, 'black') // no flippable
    expect(result).toBe(board)
  })
})

describe('countPieces', () => {
  it('counts 2 black and 2 white on the initial board', () => {
    const board = createInitialBoard()
    expect(countPieces(board)).toEqual({ black: 2, white: 2 })
  })

  it('counts pieces correctly on an all-black board', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    expect(countPieces(board)).toEqual({ black: 64, white: 0 })
  })
})

describe('isBoardFull', () => {
  it('returns false for the initial board', () => {
    expect(isBoardFull(createInitialBoard())).toBe(false)
  })

  it('returns true when every cell is filled', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    expect(isBoardFull(board)).toBe(true)
  })

  it('returns false when at least one cell is null', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    board[0][0] = null
    expect(isBoardFull(board)).toBe(false)
  })
})

describe('checkGameEnd', () => {
  it('is not finished for the initial board', () => {
    const board = createInitialBoard()
    expect(checkGameEnd(board, 0).finished).toBe(false)
  })

  it('detects annihilation when black has no pieces', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('white'))
    const result = checkGameEnd(board, 0)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('annihilated')
  })

  it('detects annihilation when white has no pieces', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    const result = checkGameEnd(board, 0)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('annihilated')
  })

  it('detects full board', () => {
    const board: Board = Array.from({ length: 8 }, (_, i) =>
      Array(8).fill(i % 2 === 0 ? 'black' : 'white'),
    )
    const result = checkGameEnd(board, 0)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('full')
  })

  it('detects both-pass situation', () => {
    const board = createInitialBoard()
    const result = checkGameEnd(board, 2)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('bothPass')
  })
})

describe('determineWinner', () => {
  it('returns black when black has more pieces', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    expect(determineWinner(board)).toBe('black')
  })

  it('returns white when white has more pieces', () => {
    const board: Board = Array.from({ length: 8 }, () => Array(8).fill('white'))
    expect(determineWinner(board)).toBe('white')
  })

  it('returns draw when counts are equal', () => {
    const board = createInitialBoard()
    expect(determineWinner(board)).toBe('draw')
  })
})

describe('createInitialGameState', () => {
  it('has status waiting', () => {
    const state = createInitialGameState()
    expect(state.status).toBe('waiting')
  })

  it('has currentPlayer black', () => {
    const state = createInitialGameState()
    expect(state.currentPlayer).toBe('black')
  })

  it('has an empty players array', () => {
    const state = createInitialGameState()
    expect(state.players).toHaveLength(0)
  })

  it('has a valid initial board', () => {
    const state = createInitialGameState()
    expect(countPieces(state.board)).toEqual({ black: 2, white: 2 })
  })

  it('has winner null and passCount 0', () => {
    const state = createInitialGameState()
    expect(state.winner).toBeNull()
    expect(state.passCount).toBe(0)
  })
})

// Helper: create a playing game state with two players
function playingState(): GameState {
  const state = createInitialGameState()
  return {
    ...state,
    status: 'playing',
    players: [
      { id: 'p1', color: 'black', name: 'Alice' },
      { id: 'p2', color: 'white', name: 'Bob' },
    ],
  }
}

describe('processMove', () => {
  it('returns same state when status is not playing', () => {
    const state = createInitialGameState() // status: 'waiting'
    const result = processMove(state, 3, 2, 'p1')
    expect(result).toBe(state)
  })

  it('returns same state when player is not found', () => {
    const state = playingState()
    const result = processMove(state, 3, 2, 'unknown')
    expect(result).toBe(state)
  })

  it('returns same state when it is not the player\'s turn', () => {
    const state = playingState() // black's turn
    const result = processMove(state, 3, 2, 'p2') // p2 is white
    expect(result).toBe(state)
  })

  it('returns same state for an invalid move position', () => {
    const state = playingState()
    const result = processMove(state, 0, 0, 'p1') // no flippable
    expect(result).toBe(state)
  })

  it('applies a valid move and switches player', () => {
    const state = playingState()
    const result = processMove(state, 3, 2, 'p1') // valid black move
    expect(result).not.toBe(state)
    expect(result.board[3][2]).toBe('black')
    expect(result.currentPlayer).toBe('white')
  })

  it('resets passCount after a valid move', () => {
    const state = { ...playingState(), passCount: 1 }
    const result = processMove(state, 3, 2, 'p1')
    expect(result.passCount).toBe(0)
  })
})
