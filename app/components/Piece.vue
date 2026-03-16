<template>
  <div
    class="w-[72%] h-[72%] rounded-full transition-all duration-500 relative overflow-hidden"
    :class="color === 'black'
      ? 'bg-gradient-to-br from-gray-600 via-gray-800 to-black shadow-[0_6px_0_rgba(0,0,0,0.5),0_8px_18px_rgba(0,0,0,0.75),inset_0_1px_3px_rgba(255,255,255,0.2)]'
      : 'bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-[0_6px_0_rgba(0,0,0,0.25),0_8px_18px_rgba(0,0,0,0.4),inset_0_1px_3px_rgba(255,255,255,1)] border-2 border-gray-200'"
  >
    <!-- Gloss highlight -->
    <div aria-hidden="true" class="absolute top-[8%] left-[12%] w-[40%] h-[28%] rounded-full bg-white"
      :class="color === 'black' ? 'opacity-25' : 'opacity-80'" />
    <!-- Bottom rim for thickness illusion -->
    <div aria-hidden="true" class="absolute bottom-0 left-0 w-full h-[12%] rounded-b-full"
      :class="color === 'black' ? 'bg-black/40' : 'bg-gray-300/60'" />
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'

defineProps<{
  color: PlayerColor
}>()
</script>
