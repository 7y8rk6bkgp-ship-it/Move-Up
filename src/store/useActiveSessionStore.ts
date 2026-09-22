import { create } from 'zustand'

const STORAGE_KEY = 'move-up:active-session-id'

interface ActiveSessionState {
  activeSessionId: string | null
  setActiveSessionId: (id: string | null) => void
}

function readInitial(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const useActiveSessionStore = create<ActiveSessionState>((set) => ({
  activeSessionId: readInitial(),
  setActiveSessionId: (id) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors (private browsing, etc.) — training data itself lives in Dexie
    }
    set({ activeSessionId: id })
  },
}))
