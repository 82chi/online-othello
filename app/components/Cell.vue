<template>
  <div
    class="aspect-square flex items-center justify-center border border-green-900/50 transition-all duration-200"
    :class="[
      isHighlighted ? 'bg-green-500/70 cursor-pointer hover:bg-green-400/80' : 'bg-green-800',
    ]"
    @click="isHighlighted && emit('click')"
  >
    <Piece v-if="value" :color="value" />
    <div
      v-else-if="isHighlighted"
      class="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-300/60"
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
