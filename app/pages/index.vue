<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300"
    :class="isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'"
  >
    <!-- Language switcher + Theme toggle -->
    <div class="absolute top-5 right-5 flex gap-2 items-center">
      <button
        v-for="locale in locales"
        :key="locale.code"
        class="px-5 py-2 text-sm font-semibold rounded-full transition-colors"
        :class="locale.code === currentLocale
          ? 'bg-blue-600 text-white shadow-lg'
          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
        @click="setLocale(locale.code)"
      >
        {{ locale.name }}
      </button>
      <button
        class="px-3 py-2 text-sm rounded-full transition-colors"
        :class="isDark ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
        :title="isDark ? $t('theme.light') : $t('theme.dark')"
        @click="toggleTheme"
      >
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>

    <!-- Title -->
    <div class="text-center mb-12">
      <h1 class="text-6xl sm:text-7xl font-extrabold mb-4 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
        {{ $t('home.title') }}
      </h1>
      <p class="text-xl sm:text-2xl font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ $t('home.subtitle') }}</p>
    </div>

    <!-- Create room form -->
    <div
      class="backdrop-blur-sm rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl"
      :class="isDark ? 'bg-gray-800/90 border border-gray-700/50' : 'bg-white border border-gray-200'"
    >
      <!-- Player name -->
      <div class="mb-7">
        <label class="block text-lg font-semibold mb-2" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
          {{ $t('home.yourName') }}
        </label>
        <input
          v-model="playerName"
          type="text"
          maxlength="20"
          class="w-full px-5 py-4 text-lg rounded-xl border focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all"
          :class="isDark ? 'bg-gray-700/80 text-white border-gray-600 placeholder-gray-500' : 'bg-gray-50 text-gray-900 border-gray-300 placeholder-gray-400'"
        />
      </div>

      <!-- Color selection -->
      <div class="mb-10">
        <label class="block text-lg font-semibold mb-3" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
          {{ $t('home.chooseColor') }}
        </label>
        <div class="flex gap-4">
          <button
            class="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all font-bold text-lg"
            :class="selectedColor === 'black'
              ? 'border-blue-500 bg-blue-900/40 text-white shadow-lg shadow-blue-900/30'
              : isDark ? 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200' : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'"
            @click="selectedColor = 'black'"
          >
            <div class="w-8 h-8 rounded-full bg-gray-950 border-2 border-gray-500 shadow-inner" />
            {{ $t('home.black') }}
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all font-bold text-lg"
            :class="selectedColor === 'white'
              ? 'border-blue-500 bg-blue-900/40 text-white shadow-lg shadow-blue-900/30'
              : isDark ? 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200' : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'"
            @click="selectedColor = 'white'"
          >
            <div class="w-8 h-8 rounded-full bg-white border-2 border-gray-300 shadow-inner" />
            {{ $t('home.white') }}
          </button>
        </div>
      </div>

      <!-- Create button -->
      <button
        class="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-extrabold rounded-xl transition-all text-2xl shadow-lg shadow-green-900/40 hover:shadow-green-800/60 active:scale-95"
        @click="createRoom"
      >
        {{ $t('home.createRoom') }}
      </button>
    </div>

    <!-- Decorative board preview -->
    <div class="mt-12 grid grid-cols-4 gap-2 opacity-40 mx-auto w-fit">
      <div v-for="i in 16" :key="i" class="w-12 h-12 bg-green-700 border border-green-800 rounded-sm flex items-center justify-center">
        <div
          v-if="[5, 6, 9, 10].includes(i)"
          class="w-9 h-9 rounded-full flex-shrink-0 mx-auto"
          :class="[5, 10].includes(i) ? 'bg-white' : 'bg-gray-950'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayerColor } from '~/types/game'
import { useTheme } from '~/composables/useTheme'

const { locale: currentLocale, locales, setLocale } = useI18n()
const router = useRouter()
const { generateRoomId, getOrCreateGuestName, setGuestName } = useRoom()
const { isDark, toggleTheme } = useTheme()

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
