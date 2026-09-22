interface Props {
  value: number | null
  onChange: (v: number | null) => void
}

const values = [6, 7, 8, 9, 10]

export function RpePicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      <span className="mr-1 shrink-0 text-xs text-(--color-ink-muted)">RPE</span>
      {values.map((v) => (
        <button
          key={v}
          onClick={() => onChange(value === v ? null : v)}
          className={`h-7 w-7 shrink-0 rounded-full text-xs font-semibold transition-colors ${
            value === v
              ? 'bg-(--color-accent) text-white'
              : 'bg-(--color-surface-2) text-(--color-ink-muted)'
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}
