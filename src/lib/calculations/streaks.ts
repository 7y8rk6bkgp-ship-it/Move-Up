import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

export interface StreakResult {
  current: number
  longest: number
}

/**
 * Computes current & longest streaks from a list of ISO session dates.
 * A streak is a run of consecutive calendar days with at least one session.
 * "Current" stays alive if the most recent trained day is today or yesterday.
 */
export function computeStreaks(sessionDates: string[], now: Date = new Date()): StreakResult {
  if (sessionDates.length === 0) return { current: 0, longest: 0 }

  const uniqueDays = Array.from(
    new Set(sessionDates.map((d) => startOfDay(parseISO(d)).getTime())),
  ).sort((a, b) => a - b)

  let longest = 1
  let run = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const gap = differenceInCalendarDays(new Date(uniqueDays[i]), new Date(uniqueDays[i - 1]))
    if (gap === 1) {
      run += 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
  }

  const lastDay = uniqueDays[uniqueDays.length - 1]
  const daysSinceLast = differenceInCalendarDays(startOfDay(now), new Date(lastDay))

  let current = 0
  if (daysSinceLast <= 1) {
    current = 1
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      const gap = differenceInCalendarDays(new Date(uniqueDays[i]), new Date(uniqueDays[i - 1]))
      if (gap === 1) {
        current += 1
      } else {
        break
      }
    }
  }

  return { current, longest }
}
