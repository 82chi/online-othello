<template>
  <div class="grid grid-cols-8 gap-0 border-4 border-green-950 rounded-xl shadow-2xl w-full max-w-[min(92vw,92vh,600px)] mx-auto aspect-square bg-green-950">
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

const props = defineProps<{ board: Board validMoves: [number, number][] isMyTurn: boolean }>()

const emit = defineEmits<{ move: [row: number, col: number] }>()

const flatBoard = computed(() => props.board.flat())

function isValidMoveAt(row: number, col: number): boolean {
  return props.validMoves.some(([r, c]) => r === row && c === col)
}
</script>