<template>
  <div
    class="w-4 h-4 rounded-full sm:w-6 sm:h-6 md:w-8 md:h-8"
    :class="color === 'black' ? 'bg-gray-900 shadow-inner' : 'bg-white border border-gray-300 shadow-inner'"
  />
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'

defineProps<{
  color: PlayerColor
}>()
</script>
