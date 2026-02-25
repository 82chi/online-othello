<template>
  <div class="grid grid-cols-8 gap-0 border-2 border-green-900 rounded w-full max-w-[min(90vw,90vh,480px)] mx-auto aspect-square">
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
