<template>
  <div
    class="flex flex-col items-center gap-2 p-5 rounded-lg w-full max-w-md mx-auto transition-colors duration-300"
    :class="isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 shadow-md border border-gray-200'"
  >
    <!-- Win/Loss record -->
    <div v-if="wins !== undefined && losses !== undefined" class="text-base font-semibold" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
      {{ $t('result.wins', { count: wins }) }} {{ $t('result.losses', { count: losses }) }}
    </div>

    <!-- Score -->
    <div class="flex items-center gap-4 text-3xl font-bold">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-950 border-2 border-gray-600 shadow-md" />
        <span>{{ blackCount }}</span>
      </div>
      <span :class="isDark ? 'text-gray-400' : 'text-gray-500'">:</span>
      <div class="flex items-center gap-2">
        <span>{{ whiteCount }}</span>
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-200 border-2 border-gray-300 shadow-md" />
      </div>
    </div>

    <!-- Turn indicator -->
    <div class="text-base font-medium" :class="isMyTurn ? 'text-yellow-400' : isDark ? 'text-gray-400' : 'text-gray-500'">
      <span v-if="status === 'waiting'">{{ $t('room.waiting') }}</span>
      <span v-else-if="status === 'playing'">
        {{ isMyTurn ? $t('game.yourTurn') : $t('game.opponentTurn') }}
      </span>
      <span v-else>{{ $t('result.title') }}</span>
    </div>

    <!-- Players -->
    <div class="flex items-center gap-4 text-sm" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
      <div v-if="blackPlayer" class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-950" />
        <span>{{ blackPlayer.name }}</span>
        <span v-if="blackPlayer.id === myId" class="text-yellow-400">({{ $t('room.yourColor') }})</span>
      </div>
      <span v-if="blackPlayer && whitePlayer" :class="isDark ? 'text-gray-600' : 'text-gray-400'">vs</span>
      <div v-if="whitePlayer" class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-200 border border-gray-400" />
        <span>{{ whitePlayer.name }}</span>
        <span v-if="whitePlayer.id === myId" class="text-yellow-400">({{ $t('room.yourColor') }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameState } from '~/types/game'
import { countPieces } from '~/composables/useOthello'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  gameState: GameState
  myId: string
  isMyTurn: boolean
  wins?: number
  losses?: number
}>()

const { isDark } = useTheme()

const blackCount = computed(() => countPieces(props.gameState.board).black)
const whiteCount = computed(() => countPieces(props.gameState.board).white)

const blackPlayer = computed(() => props.gameState.players.find(p => p.color === 'black'))
const whitePlayer = computed(() => props.gameState.players.find(p => p.color === 'white'))
const status = computed(() => props.gameState.status)
</script>
