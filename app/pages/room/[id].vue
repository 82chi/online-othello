<template>
  <div
    class="min-h-screen flex flex-col transition-colors duration-300"
    :class="isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between p-4 border-b"
      :class="isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'"
    >
      <NuxtLink to="/" :class="isDark ? 'text-gray-400 hover:text-white transition-colors text-base' : 'text-gray-500 hover:text-gray-900 transition-colors text-base'">
        ← {{ $t('result.home') }}
      </NuxtLink>

      <!-- Language switcher + Theme toggle -->
      <div class="flex gap-2 items-center">
        <button
          v-for="locale in locales"
          :key="locale.code"
          class="px-3 py-2 text-sm rounded transition-colors"
          :class="locale.code === currentLocale
            ? 'bg-blue-600 text-white'
            : isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
          @click="setLocale(locale.code)"
        >
          {{ locale.name }}
        </button>
        <button
          class="px-3 py-2 text-sm rounded transition-colors"
          :class="isDark ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
          :title="isDark ? $t('theme.light') : $t('theme.dark')"
          @click="toggleTheme"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button
          class="px-3 py-2 text-sm rounded transition-colors"
          :class="isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
          :title="isMuted ? $t('sound.on') : $t('sound.off')"
          @click="toggleMute"
        >
          {{ isMuted ? '🔇' : '🔊' }}
        </button>
      </div>
    </div>

    <!-- Error states -->
    <div v-if="error === 'room_full'" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-7xl mb-4">🚫</div>
        <h2 class="text-2xl font-bold text-red-400 mb-2">{{ $t('room.full') }}</h2>
        <NuxtLink to="/" class="text-blue-400 hover:text-blue-300 underline">{{ $t('result.home') }}</NuxtLink>
      </div>
    </div>

    <!-- Waiting screen -->
    <div v-else-if="!gameState || gameState.status === 'waiting'" class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="text-center mb-6">
        <div class="text-6xl mb-4">♟️</div>
        <h2 class="text-2xl font-bold mb-2">{{ $t('room.waiting') }}</h2>
        <p :class="isDark ? 'text-gray-400 text-base' : 'text-gray-600 text-base'">{{ $t('room.waitingDesc') }}</p>
      </div>

      <!-- URL copy -->
      <div :class="isDark ? 'flex items-center gap-2 bg-gray-800 rounded-lg p-4 mb-4 w-full max-w-lg' : 'flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-4 mb-4 w-full max-w-lg'">
        <input
          :value="currentUrl"
          readonly
          :class="isDark ? 'flex-1 bg-transparent text-gray-300 text-base focus:outline-none' : 'flex-1 bg-transparent text-gray-700 text-base focus:outline-none'"
        />
        <button
          class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-base font-medium transition-colors whitespace-nowrap text-white"
          @click="copyUrl"
        >
          {{ copied ? $t('room.copied') : $t('room.copyUrl') }}
        </button>
      </div>

      <!-- My color info -->
      <div v-if="gameState" :class="isDark ? 'text-base text-gray-400' : 'text-base text-gray-600'">
        {{ $t('room.yourColor') }}:
        <span class="font-bold" :class="myPlayer?.color === 'black' ? (isDark ? 'text-gray-300' : 'text-gray-700') : 'text-gray-400'">
          {{ myPlayer?.color === 'black' ? $t('game.black') : $t('game.white') }}
        </span>
      </div>

      <div :class="isDark ? 'mt-4 flex items-center gap-2 text-gray-500 text-base' : 'mt-4 flex items-center gap-2 text-gray-400 text-base'">
        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        {{ isConnecting ? $t('room.reconnecting') : $t('room.waiting') }}
      </div>
    </div>

    <!-- Game screen -->
    <div v-else-if="gameState.status === 'playing' || gameState.status === 'finished'" class="flex-1 flex flex-col lg:flex-row gap-3 p-4 min-h-0">

      <!-- Main game area -->
      <div class="flex flex-col items-center gap-3 flex-1">
        <!-- ScoreBoard + Mobile chat button -->
        <div class="flex items-center gap-2 w-full">
          <div class="flex-1 min-w-0">
            <ScoreBoard
              :game-state="gameState"
              :my-id="myId"
              :is-my-turn="isMyTurn"
              :wins="wins"
              :losses="losses"
            />
          </div>

          <!-- スマホ用チャットボタン（ScoreBoardの右側余白に配置） -->
          <button
            class="lg:hidden flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg transition-colors"
            :class="isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
            @click="openChat"
          >
            <span class="text-2xl">💬</span>
            <span
              v-if="unreadCount > 0"
              class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >{{ unreadCount }}</span>
          </button>
        </div>

        <!-- Board -->
        <Board
          :board="gameState.board"
          :valid-moves="isMyTurn ? validMoves : []"
          :is-my-turn="isMyTurn"
          @move="handleMove"
        />

        <!-- Reaction buttons -->
        <div v-if="gameState.status === 'playing'" class="flex gap-2">
          <button
            v-for="emoji in ['👍', '😮', '🔥', '😂']"
            :key="emoji"
            class="text-2xl hover:scale-125 transition-transform active:scale-95"
            :class="reactionCooldown ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="reactionCooldown"
            @click="sendReactionWithCooldown(emoji)"
          >
            {{ emoji }}
          </button>
        </div>

        <!-- Opponent left notice -->
        <div v-if="opponentLeft" class="w-full max-w-md bg-red-900/50 border border-red-700 rounded-lg p-3 text-center text-base text-red-300">
          {{ $t('room.opponentLeft') }}
        </div>
      </div>

      <!-- Mobile drawer overlay -->
      <div
        v-if="chatOpen"
        class="lg:hidden fixed inset-0 bg-black/50 z-40"
        @click="chatOpen = false"
      />

      <!-- Mobile drawer -->
      <div
        class="lg:hidden fixed right-0 top-0 h-full w-4/5 max-w-sm z-50 transition-transform duration-300"
        :class="chatOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="relative h-full">
          <button
            class="absolute top-3 right-3 z-10 bg-gray-700 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
            @click="chatOpen = false"
          >
            ✕
          </button>
          <Chat
            :messages="chatMessages"
            :my-id="myId"
            @send="sendChat"
          />
        </div>
      </div>

      <!-- PC chat sidebar (lg以上のみ表示) -->
      <div class="hidden lg:block lg:w-80 lg:h-auto flex-shrink-0">
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
        <div :class="isDark ? 'bg-gray-800 rounded-2xl p-8 text-center max-w-md w-full mx-4' : 'bg-white rounded-2xl p-8 text-center max-w-md w-full mx-4 shadow-xl'">
          <p class="text-xl font-bold mb-4">{{ opponent?.name }} {{ $t('result.rematch') }}?</p>
          <div class="flex gap-3 justify-center">
            <button
              class="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
              @click="acceptRematch"
            >
              ✓
            </button>
            <button
              class="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors"
              @click="declineRematch"
            >
              ✗
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reaction overlay -->
    <div class="fixed inset-0 pointer-events-none z-50">
      <TransitionGroup name="reaction-from-left" tag="div">
        <div
          v-for="r in blackReactions"
          :key="r.id"
          class="text-[80px] drop-shadow-lg rounded-full p-2 absolute"
          :style="{
            border: '3px solid #222',
            background: 'rgba(0,0,0,0.15)',
            left: '10%',
            top: r.top,
          }"
        >
          {{ r.emoji }}
        </div>
      </TransitionGroup>
      <TransitionGroup name="reaction-from-right" tag="div">
        <div
          v-for="r in whiteReactions"
          :key="r.id"
          class="text-[80px] drop-shadow-lg rounded-full p-2 absolute"
          :style="{
            border: '3px solid #fff',
            background: 'rgba(255,255,255,0.15)',
            right: '10%',
            top: r.top,
          }"
        >
          {{ r.emoji }}
        </div>
      </TransitionGroup>
    </div>

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
import { useWinLoss } from '~/composables/useWinLoss'
import { useTheme } from '~/composables/useTheme'
import { useSound } from '~/composables/useSound'

const route = useRoute()
const router = useRouter()
const { locale: currentLocale, locales, setLocale } = useI18n()
const { getOrCreateGuestName } = useRoom()
const { wins, losses, addWin, addLoss } = useWinLoss()
const { isDark, toggleTheme } = useTheme()
const { isMuted, toggleMute } = useSound()

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
  reactions,
  lastReceivedChat,
  connect,
  sendMove,
  sendChat,
  sendReaction,
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

watch(showResult, (val) => {
  if (val && gameState.value && myPlayer.value) {
    const winner = gameState.value.winner
    if (winner === myPlayer.value.color) {
      addWin()
    } else if (winner !== 'draw') {
      addLoss()
    }
  }
})

function goHome() {
  router.push('/')
}

// Reaction cooldown
const REACTION_COOLDOWN_MS = 3000
const reactionCooldown = ref(false)

function sendReactionWithCooldown(emoji: string) {
  if (reactionCooldown.value) return
  sendReaction(emoji)
  reactionCooldown.value = true
  setTimeout(() => { reactionCooldown.value = false }, REACTION_COOLDOWN_MS)
}

const blackReactions = computed(() => reactions.value.filter(r => r.fromColor === 'black'))
const whiteReactions = computed(() => reactions.value.filter(r => r.fromColor === 'white'))

// Connect on mount
onMounted(() => {
  connect(playerName, preferredColor)
})

// Mobile chat drawer
const chatOpen = ref(false)
const unreadCount = ref(0)

function openChat() {
  chatOpen.value = true
  unreadCount.value = 0
}

watch(lastReceivedChat, (msg) => {
  if (!msg) return
  if (!chatOpen.value && msg.playerId !== myId.value) {
    unreadCount.value++
  }
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

/* 黒プレイヤー: 左から中央 */
.reaction-from-left-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reaction-from-left-leave-active {
  transition: opacity 0.8s ease;
}
.reaction-from-left-enter-from {
  opacity: 0;
  transform: translateX(-40vw);
}
.reaction-from-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.reaction-from-left-leave-to {
  opacity: 0;
  transform: translateX(0);
}

/* 白プレイヤー: 右から中央 */
.reaction-from-right-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.reaction-from-right-leave-active {
  transition: opacity 0.8s ease;
}
.reaction-from-right-enter-from {
  opacity: 0;
  transform: translateX(40vw);
}
.reaction-from-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.reaction-from-right-leave-to {
  opacity: 0;
  transform: translateX(0);
}
</style>
