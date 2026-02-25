<template>
  <div
    class="aspect-square flex items-center justify-center border border-green-800 transition-colors duration-150"
    :class="[
      isHighlighted ? 'bg-green-400 cursor-pointer hover:bg-green-300' : 'bg-green-700',
    ]"
    @click="isHighlighted && emit('click')"
  >
    <Piece v-if="value" :color="value" />
    <div
      v-else-if="isHighlighted"
      class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-600 opacity-70"
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
