import { create } from 'zustand'

export interface PrCelebration {
  id: string
  exerciseName: string
  kind: 'peso' | '1rm' | 'volumen'
  valueKg: number
  previousKg: number | null
}

export interface AchievementUnlock {
  id: string
  name: string
  description: string
  icon: string
}

export interface Toast {
  id: string
  message: string
  tone: 'info' | 'success' | 'error'
}

interface UIState {
  prQueue: PrCelebration[]
  achievementQueue: AchievementUnlock[]
  toasts: Toast[]
  pushPrCelebration: (pr: Omit<PrCelebration, 'id'>) => void
  dismissPrCelebration: (id: string) => void
  pushAchievementUnlock: (a: Omit<AchievementUnlock, 'id'>) => void
  dismissAchievementUnlock: (id: string) => void
  pushToast: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  prQueue: [],
  achievementQueue: [],
  toasts: [],

  pushPrCelebration: (pr) =>
    set((state) => ({
      prQueue: [...state.prQueue, { ...pr, id: crypto.randomUUID() }],
    })),
  dismissPrCelebration: (id) =>
    set((state) => ({ prQueue: state.prQueue.filter((p) => p.id !== id) })),

  pushAchievementUnlock: (a) =>
    set((state) => ({
      achievementQueue: [...state.achievementQueue, { ...a, id: crypto.randomUUID() }],
    })),
  dismissAchievementUnlock: (id) =>
    set((state) => ({ achievementQueue: state.achievementQueue.filter((a) => a.id !== id) })),

  pushToast: (message, tone = 'info') =>
    set((state) => ({ toasts: [...state.toasts, { id: crypto.randomUUID(), message, tone }] })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
