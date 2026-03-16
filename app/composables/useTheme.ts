const theme = ref<'light' | 'dark'>('light')
let initialized = false

export function useTheme() {
  if (import.meta.client && !initialized) {
    initialized = true
    const stored = sessionStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      theme.value = stored
    }
  }

  const isDark = computed(() => theme.value === 'dark')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    if (import.meta.client) {
      sessionStorage.setItem('theme', theme.value)
    }
  }

  return { isDark, toggleTheme }
}