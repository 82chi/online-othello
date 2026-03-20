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

describe('createInitialBoard', () => {
  it('8x8のボードを返す', () => {
    const board = createInitialBoard()
    expect(board).toHaveLength(8)
    expect(board[0]).toHaveLength(8)
  })

  it('初期4石が正しい位置に配置されている', () => {
    const board = createInitialBoard()
    expect(board[3][3]).toBe('white')
    expect(board[3][4]).toBe('black')
    expect(board[4][3]).toBe('black')
    expect(board[4][4]).toBe('white')
  })

  it('初期状態では4マス以外はnull', () => {
    const board = createInitialBoard()
    const filled = board.flat().filter(c => c !== null)
    expect(filled).toHaveLength(4)
  })
})

describe('countPieces', () => {
  it('初期状態で黒2・白2', () => {
    const board = createInitialBoard()
    expect(countPieces(board)).toEqual({ black: 2, white: 2 })
  })
})

describe('getValidMoves', () => {
  it('初期状態で黒の有効手が4つ', () => {
    const board = createInitialBoard()
    expect(getValidMoves(board, 'black')).toHaveLength(4)
  })

  it('初期状態で白の有効手が4つ', () => {
    const board = createInitialBoard()
    expect(getValidMoves(board, 'white')).toHaveLength(4)
  })
})

describe('applyMove', () => {
  it('有効な手を打つと石がひっくり返る', () => {
    const board = createInitialBoard()
    // 黒が(2,3)に置く（初期状態の有効手のひとつ）
    const newBoard = applyMove(board, 2, 3, 'black')
    expect(newBoard[2][3]).toBe('black')
    expect(newBoard[3][3]).toBe('black') // ひっくり返った
  })

  it('無効な手はボードを変えない', () => {
    const board = createInitialBoard()
    const newBoard = applyMove(board, 0, 0, 'black')
    expect(newBoard).toBe(board) // 同一参照
  })
})

describe('isBoardFull', () => {
  it('初期状態はfalse', () => {
    expect(isBoardFull(createInitialBoard())).toBe(false)
  })

  it('全マス埋まっているとtrue', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    expect(isBoardFull(board as any)).toBe(true)
  })
})

describe('checkGameEnd', () => {
  it('通常の状態はfinished=false', () => {
    const result = checkGameEnd(createInitialBoard(), 0)
    expect(result.finished).toBe(false)
  })

  it('passCount >= 2 でfinished=true', () => {
    const result = checkGameEnd(createInitialBoard(), 2)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('bothPass')
  })

  it('ボードが満杯でfinished=true', () => {
    const board = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 8 }, (_, c) => ((r + c) % 2 === 0 ? 'black' : 'white'))
    )
    const result = checkGameEnd(board as any, 0)
    expect(result.finished).toBe(true)
    expect(result.reason).toBe('full')
  })
})

describe('determineWinner', () => {
  it('黒が多い場合は黒の勝ち', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill('black'))
    expect(determineWinner(board as any)).toBe('black')
  })

  it('白が多い場合は白の勝ち', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill('white'))
    expect(determineWinner(board as any)).toBe('white')
  })

  it('同数は引き分け', () => {
    const board = createInitialBoard() // black=2, white=2
    expect(determineWinner(board)).toBe('draw')
  })
})

describe('processMove', () => {
  const makeState = () => {
    const state = createInitialGameState()
    state.players = [
      { id: 'p1', color: 'black', name: 'Player1' },
      { id: 'p2', color: 'white', name: 'Player2' },
    ]
    state.status = 'playing'
    return state
  }

  it('有効な手を打つとゲーム状態が更新される', () => {
    const state = makeState()
    const newState = processMove(state, 2, 3, 'p1')
    expect(newState).not.toBe(state)
    expect(newState.board[2][3]).toBe('black')
  })

  it('無効な手は状態を変えない', () => {
    const state = makeState()
    const newState = processMove(state, 0, 0, 'p1')
    expect(newState).toBe(state)
  })

  it('playing以外では手を打てない', () => {
    const state = makeState()
    state.status = 'finished'
    const newState = processMove(state, 2, 3, 'p1')
    expect(newState).toBe(state)
  })

  it('自分のターンでない場合は手を打てない', () => {
    const state = makeState() // currentPlayer = 'black'
    const newState = processMove(state, 2, 3, 'p2') // p2 は white
    expect(newState).toBe(state)
  })
})
