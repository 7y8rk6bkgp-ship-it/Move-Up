import type { WeightUnit } from '@/db/types'

export const KG_TO_LB = 2.20462

export function kgToLb(kg: number): number {
  return kg * KG_TO_LB
}

export function lbToKg(lb: number): number {
  return lb / KG_TO_LB
}

/** Rounds to the nearest 0.5 (matches typical plate/dumbbell increments). */
export function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2
}

/** Converts an internal kg value to the display unit, rounded to 0.5. */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  const raw = unit === 'kg' ? kg : kgToLb(kg)
  return roundToHalf(raw)
}

/** Converts a value the user typed in the display unit back to kg for storage. */
export function toStorageKg(displayValue: number, unit: WeightUnit): number {
  const kg = unit === 'kg' ? displayValue : lbToKg(displayValue)
  return roundToHalf(kg)
}

export function formatWeight(kg: number, unit: WeightUnit, withUnit = true): string {
  const value = toDisplayWeight(kg, unit)
  const formatted = Number.isInteger(value) ? value.toString() : value.toFixed(1)
  return withUnit ? `${formatted} ${unit}` : formatted
}
