<template>
  <div
    class="aspect-square flex items-center justify-center border border-green-900/70 transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
    :class="[
      isHighlighted
        ? 'bg-green-600 cursor-pointer hover:bg-green-500 hover:scale-[1.06] hover:shadow-[inset_0_2px_6px_rgba(0,0,0,0.3),0_0_6px_rgba(134,239,172,0.4)]'
        : 'bg-green-800',
    ]"
    @click="isHighlighted && emit('click')"
  >
    <Piece v-if="value" :color="value" />
    <div
      v-else-if="isHighlighted"
      class="w-[40%] h-[40%] sm:w-[45%] sm:h-[45%] rounded-full bg-green-300 opacity-60 shadow-inner"
    />
  </div>
</template>

<script setup lang="ts">
import type { CellValue } from '~/types/game'

const props = defineProps<{
  value: CellValue
  isHighlighted: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>
