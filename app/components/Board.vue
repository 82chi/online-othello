<template>
  <div class="grid grid-cols-8 gap-0 border-4 border-green-950 rounded-xl w-full max-w-[min(92vw,92vh,800px)] mx-auto aspect-square bg-green-950 shadow-[0_8px_0_#14532d,0_12px_24px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] bg-gradient-to-br from-green-900 via-green-950 to-green-950">
    <Cell
      v-for="(value, index) in flatBoard"
      :key="index"
      :value="value"
      :is-highlighted="isMyTurn && isValidMoveAt(Math.floor(index / 8), index % 8)"
      @click="emit('move', Math.floor(index / 8), index % 8)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Board } from '~/types/game'

const props = defineProps<{
  board: Board
  validMoves: [number, number][]
  isMyTurn: boolean
}>()

const emit = defineEmits<{
  move: [row: number, col: number]
}>()

const flatBoard = computed(() => props.board.flat())

function isValidMoveAt(row: number, col: number): boolean {
  return props.validMoves.some(([r, c]) => r === row && c === col)
}
</script>
