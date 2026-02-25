<template>
  <div class="flex flex-col items-center gap-2 p-3 bg-gray-800 text-white rounded-lg w-full max-w-md mx-auto">
    <!-- Score -->
    <div class="flex items-center gap-4 text-xl font-bold">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-600" />
        <span>{{ blackCount }}</span>
      </div>
      <span class="text-gray-400">:</span>
      <div class="flex items-center gap-2">
        <span>{{ whiteCount }}</span>
        <div class="w-6 h-6 rounded-full bg-white border-2 border-gray-300" />
      </div>
    </div>

    <!-- Turn indicator -->
    <div class="text-sm font-medium" :class="isMyTurn ? 'text-yellow-400' : 'text-gray-400'">
      <span v-if="status === 'waiting'">{{ $t('room.waiting') }}</span>
      <span v-else-if="status === 'playing'">
        {{ isMyTurn ? $t('game.yourTurn') : $t('game.opponentTurn') }}
      </span>
      <span v-else>{{ $t('result.title') }}</span>
    </div>

    <!-- Players -->
    <div class="flex items-center gap-4 text-xs text-gray-300">
      <div v-if="blackPlayer" class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-gray-900" />
        <span>{{ blackPlayer.name }}</span>
        <span v-if="blackPlayer.id === myId" class="text-yellow-400">({{ $t('room.yourColor') }})</span>
      </div>
      <span v-if="blackPlayer && whitePlayer" class="text-gray-600">vs</span>
      <div v-if="whitePlayer" class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-white border border-gray-400" />
        <span>{{ whitePlayer.name }}</span>
        <span v-if="whitePlayer.id === myId" class="text-yellow-400">({{ $t('room.yourColor') }})</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameState } from '~/types/game'
import { countPieces } from '~/composables/useOthello'

const props = defineProps<{
  gameState: GameState
  myId: string
  isMyTurn: boolean
}>()

const blackCount = computed(() => countPieces(props.gameState.board).black)
const whiteCount = computed(() => countPieces(props.gameState.board).white)

const blackPlayer = computed(() => props.gameState.players.find(p => p.color === 'black'))
const whitePlayer = computed(() => props.gameState.players.find(p => p.color === 'white'))
const status = computed(() => props.gameState.status)
</script>
