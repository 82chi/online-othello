import type * as Party from 'partykit/server'
import {
  createInitialGameState,
  processMove,
  getValidMoves,
  determineWinner,
} from '../app/composables/useOthello'
import type { GameState, Player, PlayerColor, ChatMessage, ServerMessage, ClientMessage } from '../app/types/game'

// Rate limiting: max messages per window
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 10000
const MAX_CHAT_LENGTH = 200

interface RateLimitEntry {
  count: number
  windowStart: number
}

export default class OthelloServer implements Party.Server {
  private gameState: GameState
  private rateLimits: Map<string, RateLimitEntry> = new Map()
  private rematchVotes: Set<string> = new Set()

  constructor(readonly room: Party.Room) {
    this.gameState = createInitialGameState()
  }

  private broadcast(msg: ServerMessage, exclude?: string) {
    const data = JSON.stringify(msg)
    for (const conn of this.room.getConnections()) {
      if (conn.id !== exclude) {
        conn.send(data)
      }
    }
  }

  private send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg))
  }

  private checkRateLimit(connId: string): boolean {
    const now = Date.now()
    const entry = this.rateLimits.get(connId)
    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      this.rateLimits.set(connId, { count: 1, windowStart: now })
      return true
    }
    if (entry.count >= RATE_LIMIT_MAX) return false
    entry.count++
    return true
  }

  private sanitize(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .slice(0, MAX_CHAT_LENGTH)
  }

  onConnect(conn: Party.Connection) {
    // Will handle join in onMessage
  }

  onClose(conn: Party.Connection) {
    const playerIndex = this.gameState.players.findIndex(p => p.id === conn.id)
    if (playerIndex === -1) return

    this.gameState.players.splice(playerIndex, 1)
    this.rematchVotes.delete(conn.id)

    // Notify remaining players
    this.broadcast({ type: 'opponentLeft' })

    // If game was playing, it ends
    if (this.gameState.status === 'playing') {
      this.gameState.status = 'finished'
      this.gameState.winner = null
      this.gameState.endReason = null
      this.broadcast({ type: 'stateUpdate', state: this.gameState })
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    if (!this.checkRateLimit(sender.id)) return

    let msg: ClientMessage
    try {
      msg = JSON.parse(message) as ClientMessage
    } catch {
      return
    }

    switch (msg.type) {
      case 'join':
        this.handleJoin(sender, msg.name, msg.preferredColor)
        break
      case 'move':
        this.handleMove(sender, msg.row, msg.col)
        break
      case 'chat':
        this.handleChat(sender, msg.text)
        break
      case 'rematchRequest':
        this.handleRematchRequest(sender)
        break
      case 'rematchAccept':
        this.handleRematchAccept(sender)
        break
      case 'rematchDecline':
        this.handleRematchDecline(sender)
        break
    }
  }

  private handleJoin(conn: Party.Connection, rawName: string, preferredColor?: PlayerColor) {
    if (this.gameState.players.length >= 2) {
      this.send(conn, { type: 'error', code: 'ROOM_FULL' })
      return
    }

    const name = this.sanitize(rawName || 'Guest').slice(0, 20) || 'Guest'

    let color: PlayerColor
    if (this.gameState.players.length === 0) {
      color = preferredColor || 'black'
    } else {
      color = this.gameState.players[0].color === 'black' ? 'white' : 'black'
    }

    const player: Player = { id: conn.id, color, name }
    this.gameState.players.push(player)

    // Send current state to the new player
    this.send(conn, { type: 'init', state: this.gameState, myId: conn.id })

    // If 2 players joined, start the game
    if (this.gameState.players.length === 2) {
      this.gameState.status = 'playing'
      this.broadcast({ type: 'stateUpdate', state: this.gameState })
    }
  }

  private handleMove(conn: Party.Connection, row: number, col: number) {
    if (this.gameState.status !== 'playing') return

    const player = this.gameState.players.find(p => p.id === conn.id)
    if (!player || player.color !== this.gameState.currentPlayer) {
      this.send(conn, { type: 'error', code: 'UNAUTHORIZED' })
      return
    }

    // Validate move coordinates
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return

    const newState = processMove(this.gameState, row, col, conn.id)
    if (newState === this.gameState) return // invalid move

    this.gameState = newState
    this.broadcast({ type: 'stateUpdate', state: this.gameState })
  }

  private handleChat(conn: Party.Connection, text: string) {
    const player = this.gameState.players.find(p => p.id === conn.id)
    if (!player) return

    const sanitized = this.sanitize(text)
    if (!sanitized.trim()) return

    const message: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      playerId: conn.id,
      playerName: player.name,
      text: sanitized,
      timestamp: Date.now(),
    }

    this.broadcast({ type: 'chat', message })
  }

  private handleRematchRequest(conn: Party.Connection) {
    if (this.gameState.status !== 'finished') return
    const player = this.gameState.players.find(p => p.id === conn.id)
    if (!player) return

    this.rematchVotes.add(conn.id)

    // Notify other players
    this.broadcast({ type: 'rematchRequest', fromId: conn.id }, conn.id)

    // If both players voted for rematch
    if (this.rematchVotes.size >= 2) {
      this.startRematch()
    }
  }

  private handleRematchAccept(conn: Party.Connection) {
    this.rematchVotes.add(conn.id)
    if (this.rematchVotes.size >= 2) {
      this.startRematch()
    }
  }

  private handleRematchDecline(conn: Party.Connection) {
    this.rematchVotes.clear()
    this.broadcast({ type: 'rematchDeclined' })
  }

  private startRematch() {
    this.rematchVotes.clear()

    // Swap colors for rematch
    const players = this.gameState.players.map(p => ({
      ...p,
      color: (p.color === 'black' ? 'white' : 'black') as PlayerColor,
    }))

    const newState = createInitialGameState()
    newState.players = players
    newState.status = 'playing'
    this.gameState = newState

    this.broadcast({ type: 'rematchAccepted' })
    this.broadcast({ type: 'stateUpdate', state: this.gameState })
  }
}
