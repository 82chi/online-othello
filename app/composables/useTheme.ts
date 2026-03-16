const isDark = ref(false)

if (import.meta.client) {
  isDark.value = sessionStorage.getItem('theme') === 'dark'
}

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      sessionStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  return { isDark, toggleTheme }
}
