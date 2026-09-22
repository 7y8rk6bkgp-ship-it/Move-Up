import type { MovementPattern, MuscleGroup } from '@/db/types'

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazos: 'Antebrazos',
  abdomen: 'Abdomen',
  cuadriceps: 'Cuádriceps',
  isquiotibiales: 'Isquiotibiales',
  gluteos: 'Glúteos',
  gemelos: 'Gemelos',
  trapecios: 'Trapecios',
}

export const allMuscleGroups = Object.keys(muscleGroupLabels) as MuscleGroup[]

export const patternLabels: Record<MovementPattern, string> = {
  empuje: 'Empuje',
  tiron: 'Tirón',
  pierna: 'Pierna',
  core: 'Core',
}
