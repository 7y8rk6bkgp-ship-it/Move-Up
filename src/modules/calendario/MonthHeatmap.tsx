import {
  addDays,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'
import type { DayVolume } from '@/lib/calculations'

interface Props {
  month: Date
  volumeByDay: Map<string, DayVolume>
  onSelectDay: (dayKey: string) => void
}

function levelFor(volumeKg: number, maxVolume: number): number {
  if (volumeKg <= 0 || maxVolume <= 0) return 0
  const ratio = volumeKg / maxVolume
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export function MonthHeatmap({ month, volumeByDay, onSelectDay }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const { weeks, maxVolume } = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
    const end = endOfMonth(month)
    const days: Date[] = []
    let cursor = start
    while (cursor <= end || days.length % 7 !== 0) {
      days.push(cursor)
      cursor = addDays(cursor, 1)
    }
    const weeksArr: Date[][] = []
    for (let i = 0; i < days.length; i += 7) weeksArr.push(days.slice(i, i + 7))

    let max = 0
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd')
      const v = volumeByDay.get(key)
      if (v && v.volumeKg > max) max = v.volumeKg
    }
    return { weeks: weeksArr, maxVolume: max }
  }, [month, volumeByDay])

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((w) => (
          <div key={w} className="text-center text-[10px] font-medium text-(--color-ink-muted)">
            {w}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {week.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const data = volumeByDay.get(key)
              const level = levelFor(data?.volumeKg ?? 0, maxVolume)
              const inMonth = isSameMonth(day, month)
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelected(key)
                    onSelectDay(key)
                  }}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    inMonth ? 'text-(--color-ink)' : 'text-(--color-ink-muted)/40'
                  } ${selected === key ? 'ring-2 ring-(--color-accent)' : ''}`}
                  style={{ backgroundColor: `var(--color-heat-${inMonth ? level : 0})` }}
                >
                  {isToday(day) && (
                    <span className="absolute top-1 h-1 w-1 rounded-full bg-(--color-accent-2)" />
                  )}
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
