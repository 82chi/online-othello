<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
      <NuxtLink to="/" class="text-gray-400 hover:text-white transition-colors text-sm">
        ← {{ $t('result.home') }}
      </NuxtLink>

      <!-- Language switcher -->
      <div class="flex gap-2">
        <button
          v-for="locale in locales"
          :key="locale.code"
          class="px-2 py-1 text-xs rounded transition-colors"
          :class="locale.code === currentLocale ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'"
          @click="setLocale(locale.code)"
        >
          {{ locale.name }}
        </button>
      </div>
    </div>

    <!-- Error states -->
    <div v-if="error === 'room_full'" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">🚫</div>
        <h2 class="text-xl font-bold text-red-400 mb-2">{{ $t('room.full') }}</h2>
        <NuxtLink to="/" class="text-blue-400 hover:text-blue-300 underline">{{ $t('result.home') }}</NuxtLink>
      </div>
    </div>

    <!-- Waiting screen -->
    <div v-else-if="!gameState || gameState.status === 'waiting'" class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="text-center mb-6">
        <div class="text-5xl mb-4">♟️</div>
        <h2 class="text-xl font-bold mb-2">{{ $t('room.waiting') }}</h2>
        <p class="text-gray-400 text-sm">{{ $t('room.waitingDesc') }}</p>
      </div>

      <!-- URL copy -->
      <div class="flex items-center gap-2 bg-gray-800 rounded-lg p-3 mb-4 w-full max-w-md">
        <input
          :value="currentUrl"
          readonly
          class="flex-1 bg-transparent text-gray-300 text-sm focus:outline-none"
        />
        <button
          class="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors whitespace-nowrap"
          @click="copyUrl"
        >
          {{ copied ? $t('room.copied') : $t('room.copyUrl') }}
        </button>
      </div>

      <!-- My color info -->
      <div v-if="gameState" class="text-sm text-gray-400">
        {{ $t('room.yourColor') }}:
        <span class="font-bold" :class="myPlayer?.color === 'black' ? 'text-gray-300' : 'text-white'">
          {{ myPlayer?.color === 'black' ? $t('game.black') : $t('game.white') }}
        </span>
      </div>

      <div class="mt-4 flex items-center gap-2 text-gray-500 text-sm">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {{ isConnecting ? $t('room.reconnecting') : $t('room.waiting') }}
      </div>
    </div>

    <!-- Game screen -->
    <div v-else-if="gameState.status === 'playing' || gameState.status === 'finished'" class="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0">

      <!-- Main game area -->
      <div class="flex flex-col items-center gap-3 flex-1">
        <!-- ScoreBoard -->
        <ScoreBoard
          :game-state="gameState"
          :my-id="myId"
          :is-my-turn="isMyTurn"
        />

        <!-- Board -->
        <Board
          :board="gameState.board"
          :valid-moves="isMyTurn ? validMoves : []"
          :is-my-turn="isMyTurn"
          @move="handleMove"
        />

        <!-- Opponent left notice -->
        <div v-if="opponentLeft" class="w-full max-w-md bg-red-900/50 border border-red-700 rounded-lg p-3 text-center text-sm text-red-300">
          {{ $t('room.opponentLeft') }}
        </div>
      </div>

      <!-- Chat sidebar -->
      <div class="h-48 lg:h-auto lg:w-64 xl:w-72">
        <Chat
          :messages="chatMessages"
          :my-id="myId"
          @send="sendChat"
        />
      </div>
    </div>

    <!-- Pass notice toast -->
    <Transition name="toast">
      <div
        v-if="passNotice"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-5 py-3 rounded-full shadow-lg font-medium z-40"
      >
        {{ $t('game.passNotice') }}
      </div>
    </Transition>

    <!-- Rematch request toast -->
    <Transition name="toast">
      <div
        v-if="incomingRematch"
        class="fixed inset-0 flex items-center justify-center bg-black/60 z-40"
      >
        <div class="bg-gray-800 rounded-2xl p-6 text-center max-w-sm w-full mx-4">
          <p class="text-lg font-bold mb-4">{{ opponent?.name }} {{ $t('result.rematch') }}?</p>
          <div class="flex gap-3 justify-center">
            <button
              class="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
              @click="acceptRematch"
            >
              ✓
            </button>
            <button
              class="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors"
              @click="declineRematch"
            >
              ✗
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Game Result overlay -->
    <GameResult
      v-if="showResult"
      :game-state="gameState"
      :my-color="myPlayer?.color"
      :rematch-status="rematchStatus"
      @rematch="handleRematch"
      @home="goHome"
    />
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'
import { getValidMoves } from '~/composables/useOthello'

const route = useRoute()
const router = useRouter()
const { locale: currentLocale, locales, setLocale } = useI18n()
const { getOrCreateGuestName } = useRoom()

const roomId = route.params.id as string
const preferredColor = (route.query.color as PlayerColor) || undefined

const {
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
} = usePartykit(roomId)

const playerName = getOrCreateGuestName()

// URL copy
const copied = ref(false)
const currentUrl = computed(() => {
  if (import.meta.client) return window.location.href
  return ''
})

async function copyUrl() {
  if (import.meta.client) {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
}

// Valid moves for current board state
const validMoves = computed(() => {
  if (!gameState.value || !myPlayer.value) return []
  return getValidMoves(gameState.value.board, myPlayer.value.color)
})

function handleMove(row: number, col: number) {
  if (!isMyTurn.value) return
  sendMove(row, col)
}

// Rematch logic
const rematchStatus = ref<'idle' | 'requesting' | 'declined'>('idle')
const incomingRematch = computed(() => {
  return rematchRequest.value !== null && rematchRequest.value !== myId.value
})

function handleRematch() {
  rematchStatus.value = 'requesting'
  requestRematch()
}

watch(rematchRequest, (val) => {
  if (val === null) {
    rematchStatus.value = 'idle'
  }
})

watch(error, (val) => {
  if (val === 'rematch_declined') {
    rematchStatus.value = 'declined'
    setTimeout(() => {
      rematchStatus.value = 'idle'
      error.value = null
    }, 3000)
  }
})

// Game result
const showResult = computed(() => gameState.value?.status === 'finished')

function goHome() {
  router.push('/')
}

// Connect on mount
onMounted(() => {
  connect(playerName, preferredColor)
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
