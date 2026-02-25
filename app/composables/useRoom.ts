const GUEST_NAME_KEY = 'othello_guest_name'

export function useRoom() {
  function generateRoomId(): string {
    return Math.random().toString(36).substring(2, 10)
  }

  function getOrCreateGuestName(): string {
    if (import.meta.client) {
      const stored = localStorage.getItem(GUEST_NAME_KEY)
      if (stored) return stored
      const name = 'Guest' + Math.floor(Math.random() * 900 + 100)
      localStorage.setItem(GUEST_NAME_KEY, name)
      return name
    }
    return 'Guest' + Math.floor(Math.random() * 900 + 100)
  }

  function setGuestName(name: string): void {
    if (import.meta.client) {
      localStorage.setItem(GUEST_NAME_KEY, name)
    }
  }

  return {
    generateRoomId,
    getOrCreateGuestName,
    setGuestName,
  }
}
