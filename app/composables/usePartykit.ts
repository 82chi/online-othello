import PartySocket from 'partysocket'
import type { GameState, ChatMessage, ServerMessage, ClientMessage, PlayerColor } from '~/types/game'

export function usePartykit(roomId: string) {
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

  let passNoticeTimer: ReturnType<typeof setTimeout> | null = null

  function connect(playerName: string, preferredColor?: PlayerColor) {
    if (socket.value) return

    isConnecting.value = true
    error.value = null

    const ws = new PartySocket({
      host: partyKitHost,
      room: roomId,
      party: 'main',
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
    })

    ws.addEventListener('error', () => {
      error.value = 'connection_error'
      isConnecting.value = false
    })

    socket.value = ws
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
        // Show pass notice if passCount increased but game didn't finish
        if (prev && msg.state.passCount > prev.passCount && msg.state.status === 'playing') {
          showPassNotice()
        }
        break
      }
      case 'chat':
        chatMessages.value.push(msg.message)
        break
      case 'error':
        if (msg.code === 'ROOM_FULL') error.value = 'room_full'
        else if (msg.code === 'ROOM_NOT_FOUND') error.value = 'room_not_found'
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
    const sanitized = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 200)
    if (!sanitized.trim()) return
    const msg: ClientMessage = { type: 'chat', text: sanitized }
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

  function disconnect() {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
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
    sendMove,
    sendChat,
    requestRematch,
    acceptRematch,
    declineRematch,
    disconnect,
  }
}
