<template>
  <div
    class="w-[72%] h-[72%] rounded-full transition-all duration-300 relative overflow-hidden"
    :class="color === 'black'
      ? 'bg-gradient-to-br from-gray-700 to-gray-950 shadow-[0_4px_10px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)]'
      : 'bg-gradient-to-br from-white to-gray-200 shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-gray-300'"
  >
    <!-- Gloss highlight -->
    <div aria-hidden="true" class="absolute top-[10%] left-[15%] w-[35%] h-[25%] rounded-full opacity-60 bg-white" />
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'

defineProps<{
  color: PlayerColor
}>()
</script>
