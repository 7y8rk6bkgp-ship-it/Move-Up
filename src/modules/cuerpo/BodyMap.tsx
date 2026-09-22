import type { MuscleGroup } from '@/db/types'
import { muscleGroupLabels } from '@/lib/labels'
import { backMuscles, backSilhouette, frontMuscles, frontSilhouette, VIEW_BOX } from './muscleShapes'

interface Props {
  view: 'front' | 'back'
  volumeByMuscle: Partial<Record<MuscleGroup, number>>
  selected: MuscleGroup | null
  onSelect: (muscleGroup: MuscleGroup) => void
}

function levelFor(volumeKg: number, maxVolume: number): number {
  if (volumeKg <= 0 || maxVolume <= 0) return 0
  const ratio = volumeKg / maxVolume
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

export function BodyMap({ view, volumeByMuscle, selected, onSelect }: Props) {
  const muscles = view === 'front' ? frontMuscles : backMuscles
  const silhouette = view === 'front' ? frontSilhouette : backSilhouette
  const maxVolume = Math.max(0, ...Object.values(volumeByMuscle).map((v) => v ?? 0))

  return (
    <svg viewBox={VIEW_BOX} className="mx-auto h-auto w-full max-w-[220px]">
      <path d={silhouette} fill="var(--color-surface-3)" opacity={0.5} fillRule="evenodd" />
      {muscles.map((m, i) => {
        const volume = volumeByMuscle[m.muscleGroup] ?? 0
        const level = levelFor(volume, maxVolume)
        const isSelected = selected === m.muscleGroup
        return (
          <path
            key={`${m.muscleGroup}-${i}`}
            d={m.d}
            fill={`var(--color-muscle-${level})`}
            stroke={isSelected ? 'var(--color-accent-2)' : 'var(--color-border)'}
            strokeWidth={isSelected ? 2 : 1}
            className="cursor-pointer transition-colors"
            onClick={() => onSelect(m.muscleGroup)}
          >
            <title>{muscleGroupLabels[m.muscleGroup]}</title>
          </path>
        )
      })}
    </svg>
  )
}
