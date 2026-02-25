<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
    <div class="bg-gray-800 text-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
      <h2 class="text-2xl font-bold mb-4">{{ $t('result.title') }}</h2>

      <!-- Winner announcement -->
      <div class="text-4xl font-bold mb-4">
        <span v-if="gameState.winner === 'draw'" class="text-yellow-400">
          {{ $t('result.draw') }}
        </span>
        <span v-else-if="gameState.winner === myColor" class="text-green-400">
          🎉 {{ $t('result.winner', { color: $t(`game.${myColor}`) }) }}
        </span>
        <span v-else class="text-red-400">
          😔 {{ $t('result.winner', { color: $t(`game.${gameState.winner}`) }) }}
        </span>
      </div>

      <!-- End reason -->
      <div class="text-sm text-gray-400 mb-4">
        {{ endReasonText }}
      </div>

      <!-- Final scores -->
      <div class="flex justify-center items-center gap-6 mb-6 text-xl font-bold">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-500" />
          <span>{{ blackCount }}</span>
        </div>
        <span class="text-gray-500">:</span>
        <div class="flex items-center gap-2">
          <span>{{ whiteCount }}</span>
          <div class="w-6 h-6 rounded-full bg-white border-2 border-gray-300" />
        </div>
      </div>

      <!-- Rematch status -->
      <div v-if="rematchStatus === 'requesting'" class="text-yellow-400 text-sm mb-4">
        {{ $t('result.waitingRematch') }}
      </div>
      <div v-else-if="rematchStatus === 'declined'" class="text-red-400 text-sm mb-4">
        {{ $t('result.rematchDeclined') }}
      </div>

      <!-- Buttons -->
      <div class="flex gap-3 justify-center">
        <button
          v-if="rematchStatus !== 'requesting'"
          class="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
          @click="emit('rematch')"
        >
          {{ $t('result.rematch') }}
        </button>
        <button
          class="px-5 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors"
          @click="emit('home')"
        >
          {{ $t('result.home') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameState, PlayerColor } from '~/types/game'
import { countPieces } from '~/composables/useOthello'

const props = defineProps<{
  gameState: GameState
  myColor: PlayerColor | undefined
  rematchStatus: 'idle' | 'requesting' | 'declined'
}>()

const emit = defineEmits<{
  rematch: []
  home: []
}>()

const { t } = useI18n()

const blackCount = computed(() => countPieces(props.gameState.board).black)
const whiteCount = computed(() => countPieces(props.gameState.board).white)

const endReasonText = computed(() => {
  if (!props.gameState.endReason) return ''
  return t(`result.reason.${props.gameState.endReason}`)
})
</script>
