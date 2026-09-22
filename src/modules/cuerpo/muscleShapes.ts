import type { MuscleGroup } from '@/db/types'
import { blobPath, capsulePath, ellipsePath } from './pathHelpers'

export interface MuscleShape {
  muscleGroup: MuscleGroup
  d: string
}

export const VIEW_BOX = '0 0 200 420'

// ---- Neutral silhouette (non-interactive, drawn beneath the muscle shapes) ----
export const frontSilhouette = `
  M100,14 a16,16 0 1,0 0.01,0 Z
  M78,48 L122,48 L132,80 L128,150 L124,175 L118,255 L112,340 L118,400
  L106,400 L100,300 L94,400 L82,400 L88,340 L82,255 L76,175 L72,150 L68,80 Z
  M78,52 L48,60 L40,130 L48,132 L58,80 Z
  M122,52 L152,60 L160,130 L152,132 L142,80 Z
`

export const backSilhouette = `
  M100,14 a16,16 0 1,0 0.01,0 Z
  M78,48 L122,48 L132,80 L128,150 L124,175 L118,255 L112,340 L118,400
  L106,400 L100,300 L94,400 L82,400 L88,340 L82,255 L76,175 L72,150 L68,80 Z
  M78,52 L48,60 L40,130 L48,132 L58,80 Z
  M122,52 L152,60 L160,130 L152,132 L142,80 Z
`

export const frontMuscles: MuscleShape[] = [
  { muscleGroup: 'hombros', d: ellipsePath(63, 62, 15, 11) },
  { muscleGroup: 'hombros', d: ellipsePath(137, 62, 15, 11) },
  { muscleGroup: 'pecho', d: blobPath(70, 68, 27, 26, 0.45) },
  { muscleGroup: 'pecho', d: blobPath(103, 68, 27, 26, 0.45) },
  { muscleGroup: 'biceps', d: capsulePath(48, 82, 122, 9) },
  { muscleGroup: 'biceps', d: capsulePath(152, 82, 122, 9) },
  { muscleGroup: 'antebrazos', d: capsulePath(43, 126, 168, 8) },
  { muscleGroup: 'antebrazos', d: capsulePath(157, 126, 168, 8) },
  { muscleGroup: 'abdomen', d: blobPath(83, 98, 34, 58, 0.25) },
  { muscleGroup: 'cuadriceps', d: blobPath(74, 178, 24, 82, 0.3) },
  { muscleGroup: 'cuadriceps', d: blobPath(102, 178, 24, 82, 0.3) },
]

export const backMuscles: MuscleShape[] = [
  { muscleGroup: 'trapecios', d: blobPath(84, 46, 32, 26, 0.4) },
  { muscleGroup: 'hombros', d: ellipsePath(63, 62, 15, 11) },
  { muscleGroup: 'hombros', d: ellipsePath(137, 62, 15, 11) },
  { muscleGroup: 'espalda', d: blobPath(66, 68, 68, 62, 0.3) },
  { muscleGroup: 'triceps', d: capsulePath(48, 82, 122, 9) },
  { muscleGroup: 'triceps', d: capsulePath(152, 82, 122, 9) },
  { muscleGroup: 'antebrazos', d: capsulePath(43, 126, 168, 8) },
  { muscleGroup: 'antebrazos', d: capsulePath(157, 126, 168, 8) },
  { muscleGroup: 'gluteos', d: blobPath(72, 168, 26, 26, 0.4) },
  { muscleGroup: 'gluteos', d: blobPath(102, 168, 26, 26, 0.4) },
  { muscleGroup: 'isquiotibiales', d: blobPath(74, 196, 24, 62, 0.3) },
  { muscleGroup: 'isquiotibiales', d: blobPath(102, 196, 24, 62, 0.3) },
  { muscleGroup: 'gemelos', d: capsulePath(84, 262, 336, 14) },
  { muscleGroup: 'gemelos', d: capsulePath(116, 262, 336, 14) },
]
