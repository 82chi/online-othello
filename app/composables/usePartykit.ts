import PartySocket from 'partysocket'
import type { GameState, ChatMessage, ServerMessage, ClientMessage, PlayerColor } from '~/types/game'
import { useSound } from '~/composables/useSound'

export function usePartykit(roomId: string) {
  const { playPieceSound } = useSound()
  const config = useRuntimeConfig()
  const partyKitHost = config.public.partyKitHost as string

  const socket = ref<PartySocket | null>(null)
  const gameState = ref<GameState | null>(null)
  const myId = ref<string>('')
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)
  const chatMessages = ref<ChatMessage[]>([])
  const passNotice = ref(false)
  const rematchRequest = ref<string | null>(null)
  const opponentLeft = ref(false)
  const reactions = ref<{ id: string; emoji: string; fromName: string; fromColor: PlayerColor; top: string }[]>([])
  const lastReceivedChat = ref<ChatMessage | null>(null)

  // keep last connect params for reconnect
  const lastPlayerName = ref<string | null>(null)
  const lastPreferredColor = ref<PlayerColor | undefined>(undefined)

  let passNoticeTimer: ReturnType<typeof setTimeout> | null = null

  function connect(playerName: string, preferredColor?: PlayerColor) {
    // already connected/connecting
    if (isConnected.value || isConnecting.value) return
    // socket object still present (shouldn't happen, but guard)
    if (socket.value) return

    lastPlayerName.value = playerName
    lastPreferredColor.value = preferredColor

    isConnecting.value = true
    error.value = null

    const ws = new PartySocket({
      host: partyKitHost,
      room: roomId,
      party: 'othello',
    })

    ws.addEventListener('open', () => {
      isConnected.value = true
      isConnecting.value = false
      const msg: ClientMessage = { type: 'join', name: playerName, preferredColor }
      ws.send(JSON.stringify(msg))
    })

    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data as string)
        handleServerMessage(msg)
      } catch {
        // ignore parse errors
      }
    })

    ws.addEventListener('close', () => {
      isConnected.value = false
      isConnecting.value = false
      // allow reconnect
      socket.value = null
    })

    ws.addEventListener('error', () => {
      error.value = 'connection_error'
      isConnected.value = false
      isConnecting.value = false
      // allow reconnect
      socket.value = null
    })

    socket.value = ws
  }

  function reconnect() {
    if (!lastPlayerName.value) return
    // ensure old socket is gone
    if (socket.value) {
      try {
        socket.value.close()
      } catch {
        // ignore
      }
      socket.value = null
    }
    connect(lastPlayerName.value, lastPreferredColor.value)
  }

  function handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'init':
        gameState.value = msg.state
        myId.value = msg.myId
        break
      case 'stateUpdate': {
        const prev = gameState.value
        gameState.value = msg.state
        if (msg.state.status === 'playing') {
          opponentLeft.value = false
        }
        if (prev && msg.state.passCount > prev.passCount && msg.state.status === 'playing') {
          showPassNotice()
        }
        // Play sound when pieces are placed (total piece count changes)
        if (prev) {
          const prevCount = prev.board.flat().filter(c => c !== null).length
          const nextCount = msg.state.board.flat().filter(c => c !== null).length
          if (nextCount > prevCount) {
            playPieceSound()
          }
        }
        break
      }
      case 'chat':
        chatMessages.value.push(msg.message)
        lastReceivedChat.value = msg.message
        break
      case 'error':
        if (msg.code === 'ROOM_FULL') error.value = 'room_full'
        else if (msg.code === 'ROOM_NOT_FOUND') error.value = 'room_not_found'
        else if (msg.code === 'UNAUTHORIZED') error.value = 'unauthorized'
        else error.value = 'server_error'
        break
      case 'opponentLeft':
        opponentLeft.value = true
        break
      case 'rematchRequest':
        rematchRequest.value = msg.fromId
        break
      case 'rematchAccepted':
        rematchRequest.value = null
        break
      case 'rematchDeclined':
        rematchRequest.value = null
        error.value = 'rematch_declined'
        break
      case 'reaction': {
        const id = Math.random().toString(36).slice(2)
        const top = `${20 + Math.random() * 50}%`
        reactions.value.push({ id, emoji: msg.emoji, fromName: msg.fromName, fromColor: msg.fromColor, top })
        setTimeout(() => {
          reactions.value = reactions.value.filter(r => r.id !== id)
        }, 3000)
        break
      }
    }
  }

  function showPassNotice() {
    passNotice.value = true
    if (passNoticeTimer) clearTimeout(passNoticeTimer)
    passNoticeTimer = setTimeout(() => {
      passNotice.value = false
    }, 3000)
  }

  function sendMove(row: number, col: number) {
    if (!socket.value) return
    const msg: ClientMessage = { type: 'move', row, col }
    socket.value.send(JSON.stringify(msg))
  }

  function sendChat(text: string) {
    if (!socket.value) return
    // After removing v-html, we only need basic trimming + length limit.
    const normalized = text.slice(0, 200).trim()
    if (!normalized) return
    const msg: ClientMessage = { type: 'chat', text: normalized }
    socket.value.send(JSON.stringify(msg))
  }

  function requestRematch() {
    if (!socket.value) return
    const msg: ClientMessage = { type: 'rematchRequest' }
    socket.value.send(JSON.stringify(msg))
  }

  function acceptRematch() {
    if (!socket.value) return
    const msg: ClientMessage = { type: 'rematchAccept' }
    socket.value.send(JSON.stringify(msg))
  }

  function declineRematch() {
    if (!socket.value) return
    const msg: ClientMessage = { type: 'rematchDecline' }
    socket.value.send(JSON.stringify(msg))
  }

  function sendReaction(emoji: string) {
    if (!socket.value) return
    const msg: ClientMessage = { type: 'reaction', emoji }
    socket.value.send(JSON.stringify(msg))
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
    isConnecting.value = false
    if (passNoticeTimer) clearTimeout(passNoticeTimer)
  }

  const myPlayer = computed(() => gameState.value?.players.find(p => p.id === myId.value))
  const opponent = computed(() => gameState.value?.players.find(p => p.id !== myId.value))
  const isMyTurn = computed(() => {
    if (!gameState.value || !myPlayer.value) return false
    return gameState.value.currentPlayer === myPlayer.value.color && gameState.value.status === 'playing'
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    gameState,
    myId,
    myPlayer,
    opponent,
    isConnected,
    isConnecting,
    isMyTurn,
    error,
    chatMessages,
    passNotice,
    rematchRequest,
    opponentLeft,
    connect,
    reconnect,
    sendMove,
    sendChat,
    sendReaction,
    requestRematch,
    acceptRematch,
    declineRematch,
    disconnect,
    reactions,
    lastReceivedChat,
  }
}