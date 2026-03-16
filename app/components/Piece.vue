<template>
  <div
    class="w-[75%] h-[75%] rounded-full transition-all duration-200"
    :class="color === 'black'
      ? 'bg-gradient-to-br from-gray-700 to-gray-950 shadow-md shadow-black/50'
      : 'bg-gradient-to-br from-white to-gray-200 border border-gray-300 shadow-md shadow-black/30'"
  />
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'

defineProps<{
  color: PlayerColor
}>()
</script>
