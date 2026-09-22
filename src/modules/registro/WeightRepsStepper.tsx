import type { WeightUnit } from '@/db/types'

interface Props {
  weight: number
  reps: number
  unit: WeightUnit
  onChangeWeight: (v: number) => void
  onChangeReps: (v: number) => void
}

export function WeightRepsStepper({ weight, reps, unit, onChangeWeight, onChangeReps }: Props) {
  const weightStep = unit === 'kg' ? 2.5 : 5
  const repsStep = 1

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl bg-(--color-surface-2) p-2">
        <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-(--color-ink-muted)">
          Peso ({unit})
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onChangeWeight(Math.max(0, weight - weightStep))}
            className="h-9 w-9 rounded-lg bg-(--color-surface-3) text-lg font-bold active:opacity-70"
          >
            −
          </button>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => {
              const v = Number(e.target.value.replace(',', '.'))
              if (Number.isFinite(v)) onChangeWeight(v)
            }}
            className="w-14 bg-transparent text-center text-lg font-bold"
          />
          <button
            onClick={() => onChangeWeight(weight + weightStep)}
            className="h-9 w-9 rounded-lg bg-(--color-surface-3) text-lg font-bold active:opacity-70"
          >
            +
          </button>
        </div>
      </div>
      <div className="rounded-xl bg-(--color-surface-2) p-2">
        <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-(--color-ink-muted)">
          Reps
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={() => onChangeReps(Math.max(0, reps - repsStep))}
            className="h-9 w-9 rounded-lg bg-(--color-surface-3) text-lg font-bold active:opacity-70"
          >
            −
          </button>
          <input
            inputMode="numeric"
            value={reps}
            onChange={(e) => {
              const v = Number(e.target.value)
              if (Number.isFinite(v)) onChangeReps(v)
            }}
            className="w-10 bg-transparent text-center text-lg font-bold"
          />
          <button
            onClick={() => onChangeReps(reps + repsStep)}
            className="h-9 w-9 rounded-lg bg-(--color-surface-3) text-lg font-bold active:opacity-70"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
