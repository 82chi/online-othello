<template>
  <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
    <!-- Language switcher -->
    <div class="absolute top-4 right-4 flex gap-2">
      <button
        v-for="locale in locales"
        :key="locale.code"
        class="px-3 py-1 text-sm rounded transition-colors"
        :class="locale.code === currentLocale ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
        @click="setLocale(locale.code)"
      >
        {{ locale.name }}
      </button>
    </div>

    <!-- Title -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">{{ $t('home.title') }}</h1>
      <p class="text-gray-400">{{ $t('home.subtitle') }}</p>
    </div>

    <!-- Create room form -->
    <div class="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
      <!-- Player name -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-1">
          {{ $t('home.yourName') }}
        </label>
        <input
          v-model="playerName"
          type="text"
          maxlength="20"
          class="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400"
        />
      </div>

      <!-- Color selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-300 mb-2">
          {{ $t('home.chooseColor') }}
        </label>
        <div class="flex gap-3">
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-colors font-semibold"
            :class="selectedColor === 'black'
              ? 'border-blue-500 bg-blue-900/30 text-white'
              : 'border-gray-600 text-gray-400 hover:border-gray-400'"
            @click="selectedColor = 'black'"
          >
            <div class="w-5 h-5 rounded-full bg-gray-900 border border-gray-500" />
            {{ $t('home.black') }}
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-colors font-semibold"
            :class="selectedColor === 'white'
              ? 'border-blue-500 bg-blue-900/30 text-white'
              : 'border-gray-600 text-gray-400 hover:border-gray-400'"
            @click="selectedColor = 'white'"
          >
            <div class="w-5 h-5 rounded-full bg-white border border-gray-300" />
            {{ $t('home.white') }}
          </button>
        </div>
      </div>

      <!-- Create button -->
      <button
        class="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-lg"
        @click="createRoom"
      >
        {{ $t('home.createRoom') }}
      </button>
    </div>

    <!-- Decorative board preview -->
    <div class="mt-8 grid grid-cols-4 gap-1 opacity-20">
      <div v-for="i in 16" :key="i" class="w-8 h-8 bg-green-700 border border-green-800 rounded-sm flex items-center justify-center">
        <div
          v-if="[5, 6, 9, 10].includes(i)"
          class="w-5 h-5 rounded-full"
          :class="[5, 10].includes(i) ? 'bg-white' : 'bg-gray-900'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'

const { locale: currentLocale, locales, setLocale } = useI18n()
const router = useRouter()
const { generateRoomId, getOrCreateGuestName, setGuestName } = useRoom()

const playerName = ref(getOrCreateGuestName())
const selectedColor = ref<PlayerColor>('black')

// Sync name to localStorage when changed
watch(playerName, (name) => {
  if (name.trim()) setGuestName(name.trim())
})

function createRoom() {
  const name = playerName.value.trim() || getOrCreateGuestName()
  setGuestName(name)
  const roomId = generateRoomId()
  router.push({
    path: `/room/${roomId}`,
    query: { color: selectedColor.value },
  })
}
</script>
