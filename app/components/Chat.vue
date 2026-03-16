<template>
  <div
    class="flex flex-col h-full rounded-lg overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-gray-800' : 'bg-white border border-gray-200 shadow-md'"
  >
    <div
      class="p-2 font-semibold text-sm"
      :class="isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800 border-b border-gray-200'"
    >
      {{ $t('chat.title') }}
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="text-xs"
        :class="msg.playerId === myId ? 'text-right' : 'text-left'"
      >
        <div class="mb-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ msg.playerName }}</div>

        <!-- NOTE: Avoid v-html to prevent XSS. Render as plain text. -->
        <div
          class="inline-block px-2 py-1 rounded max-w-[80%] break-words whitespace-pre-wrap"
          :class="msg.playerId === myId
            ? 'bg-blue-600 text-white'
            : isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'"
        >
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- Input -->
    <div
      class="p-2 flex gap-2"
      :class="isDark ? 'bg-gray-700' : 'bg-gray-100 border-t border-gray-200'"
    >
      <input
        v-model="inputText"
        type="text"
        :placeholder="$t('chat.placeholder')"
        maxlength="200"
        class="flex-1 px-2 py-1 text-sm rounded border focus:outline-none focus:border-blue-400"
        :class="isDark ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-800 border-gray-300'"
        @keydown.enter="sendMessage"
      />
      <button
        class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
        @click="sendMessage"
      >
        {{ $t('chat.send') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/types/game'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  messages: ChatMessage[]
  myId: string
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const { isDark } = useTheme()

const inputText = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  },
)
</script>
