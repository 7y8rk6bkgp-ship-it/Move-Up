import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import type { DayVolume } from '@/lib/calculations'

interface Props {
  year: number
  volumeByDay: Map<string, DayVolume>
  onSelectDay: (dayKey: string, cell: DOMRect) => void
}

const CELL = 11
const GAP = 3
const STEP = CELL + GAP

function levelFor(volumeKg: number, maxVolume: number): number {
  if (volumeKg <= 0 || maxVolume <= 0) return 0
  const ratio = volumeKg / maxVolume
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

export function YearHeatmap({ year, volumeByDay, onSelectDay }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)

  const { weeks, monthLabels, maxVolume } = useMemo(() => {
    const jan1 = new Date(year, 0, 1)
    const dec31 = new Date(year, 11, 31)
    const gridStart = startOfWeek(jan1, { weekStartsOn: 0 })

    const days: Date[] = []
    let cursor = gridStart
    while (cursor <= dec31 || days.length % 7 !== 0) {
      days.push(cursor)
      cursor = addDays(cursor, 1)
      if (cursor > dec31 && days.length % 7 === 0) break
    }

    const weeksArr: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeksArr.push(days.slice(i, i + 7))
    }

    const labels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    weeksArr.forEach((week, i) => {
      const firstOfMonth = week.find((d) => d.getDate() <= 7 && d.getFullYear() === year)
      if (firstOfMonth && firstOfMonth.getMonth() !== lastMonth) {
        lastMonth = firstOfMonth.getMonth()
        labels.push({ weekIndex: i, label: format(firstOfMonth, 'MMM', { locale: es }) })
      }
    })

    let max = 0
    for (const day of days) {
      if (day.getFullYear() !== year) continue
      const key = format(day, 'yyyy-MM-dd')
      const v = volumeByDay.get(key)
      if (v && v.volumeKg > max) max = v.volumeKg
    }

    return { weeks: weeksArr, monthLabels: labels, maxVolume: max }
  }, [year, volumeByDay])

  const width = weeks.length * STEP
  const height = 7 * STEP + 14

  return (
    <div className="overflow-x-auto no-scrollbar">
      <svg width={width} height={height} role="img" aria-label={`Calendario de entrenamientos ${year}`}>
        {monthLabels.map(({ weekIndex, label }) => (
          <text
            key={weekIndex}
            x={weekIndex * STEP}
            y={10}
            fontSize={9}
            fill="var(--color-ink-muted)"
            className="capitalize"
          >
            {label}
          </text>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (day.getFullYear() !== year) return null
            const key = format(day, 'yyyy-MM-dd')
            const data = volumeByDay.get(key)
            const level = levelFor(data?.volumeKg ?? 0, maxVolume)
            return (
              <rect
                key={key}
                x={wi * STEP}
                y={di * STEP + 16}
                width={CELL}
                height={CELL}
                rx={2.5}
                fill={`var(--color-heat-${level})`}
                stroke={hovered === key ? 'var(--color-accent)' : 'transparent'}
                strokeWidth={1.5}
                onClick={(e) => onSelectDay(key, (e.target as SVGRectElement).getBoundingClientRect())}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          }),
        )}
      </svg>
    </div>
  )
}
