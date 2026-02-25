export type CellValue = 'black' | 'white' | null

export type Board = CellValue[][]

export type PlayerColor = 'black' | 'white'

export type GameStatus = 'waiting' | 'playing' | 'finished'

export type GameEndReason = 'full' | 'bothPass' | 'annihilated' | null

export interface Player {
  id: string
  color: PlayerColor
  name: string
}

export interface GameState {
  board: Board
  currentPlayer: PlayerColor
  players: Player[]
  status: GameStatus
  winner: PlayerColor | 'draw' | null
  passCount: number
  endReason: GameEndReason
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  text: string
  timestamp: number
}

export type ServerMessage =
  | { type: 'init'; state: GameState; myId: string }
  | { type: 'stateUpdate'; state: GameState }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'error'; code: 'ROOM_FULL' | 'ROOM_NOT_FOUND' | 'UNAUTHORIZED' }
  | { type: 'opponentLeft' }
  | { type: 'rematchRequest'; fromId: string }
  | { type: 'rematchAccepted' }
  | { type: 'rematchDeclined' }

export type ClientMessage =
  | { type: 'join'; name: string; preferredColor?: PlayerColor }
  | { type: 'move'; row: number; col: number }
  | { type: 'chat'; text: string }
  | { type: 'rematchRequest' }
  | { type: 'rematchAccept' }
  | { type: 'rematchDecline' }
