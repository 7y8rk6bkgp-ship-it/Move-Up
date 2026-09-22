import { create } from 'zustand'
import { db } from '@/db/db'
import type { WeightUnit } from '@/db/types'

interface SettingsState {
  unit: WeightUnit
  restTimerSeconds: number
  isLoaded: boolean
  load: () => Promise<void>
  setUnit: (unit: WeightUnit) => Promise<void>
  setRestTimerSeconds: (seconds: number) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  unit: 'kg',
  restTimerSeconds: 90,
  isLoaded: false,

  load: async () => {
    const settings = await db.settings.get('app')
    if (settings) {
      set({ unit: settings.unit, restTimerSeconds: settings.restTimerSeconds, isLoaded: true })
    } else {
      set({ isLoaded: true })
    }
  },

  setUnit: async (unit) => {
    set({ unit })
    await db.settings.put({ id: 'app', unit, restTimerSeconds: get().restTimerSeconds })
  },

  setRestTimerSeconds: async (seconds) => {
    set({ restTimerSeconds: seconds })
    await db.settings.put({ id: 'app', unit: get().unit, restTimerSeconds: seconds })
  },
}))
