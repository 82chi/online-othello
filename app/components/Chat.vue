<template>
  <div class="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
    <div class="p-2 bg-gray-700 font-semibold text-white text-sm">{{ $t('chat.title') }}</div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="text-xs"
        :class="msg.playerId === myId ? 'text-right' : 'text-left'"
      >
        <div class="text-gray-400 mb-0.5">{{ msg.playerName }}</div>
        <div
          class="inline-block px-2 py-1 rounded max-w-[80%] break-words text-white"
          :class="msg.playerId === myId ? 'bg-blue-600' : 'bg-gray-600'"
          v-html="msg.text"
        />
      </div>
    </div>

    <!-- Input -->
    <div class="p-2 bg-gray-700 flex gap-2">
      <input
        v-model="inputText"
        type="text"
        :placeholder="$t('chat.placeholder')"
        maxlength="200"
        class="flex-1 px-2 py-1 text-sm bg-gray-600 text-white rounded border border-gray-500 focus:outline-none focus:border-blue-400"
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

const props = defineProps<{
  messages: ChatMessage[]
  myId: string
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

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
