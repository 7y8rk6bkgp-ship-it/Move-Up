import type { SetEntry } from '@/db/types'

export function setVolumeKg(set: Pick<SetEntry, 'weightKg' | 'reps'>): number {
  return set.weightKg * set.reps
}

export function totalVolumeKg(sets: Pick<SetEntry, 'weightKg' | 'reps'>[]): number {
  return sets.reduce((sum, s) => sum + setVolumeKg(s), 0)
}

export function workingSets(sets: SetEntry[]): SetEntry[] {
  return sets.filter((s) => !s.isWarmup)
}

export function bestSet(sets: SetEntry[]): SetEntry | null {
  const working = workingSets(sets)
  if (working.length === 0) return null
  return working.reduce((best, s) => (s.weightKg > best.weightKg ? s : best), working[0])
}
