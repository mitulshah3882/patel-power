import { Workout } from './types/database'

/**
 * Formats a Date as a local YYYY-MM-DD string (not UTC).
 * Use this instead of toISOString().split('T')[0] to avoid timezone issues.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parses a YYYY-MM-DD string as a local date (not UTC).
 * Use this instead of new Date(dateStr) to avoid timezone issues.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function calculateStreak(workouts: Pick<Workout, 'workout_date'>[]): number {
  if (workouts.length === 0) return 0

  // Sort by date descending
  const sorted = [...workouts].sort(
    (a, b) => parseLocalDate(b.workout_date).getTime() - parseLocalDate(a.workout_date).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const mostRecent = parseLocalDate(sorted[0].workout_date)

  // Streak only counts if most recent workout is today or yesterday
  if (mostRecent < yesterday) return 0

  let streak = 1
  let currentDate = mostRecent

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(currentDate)
    prevDate.setDate(prevDate.getDate() - 1)

    const workoutDate = parseLocalDate(sorted[i].workout_date)

    if (workoutDate.getTime() === prevDate.getTime()) {
      streak++
      currentDate = workoutDate
    } else {
      break
    }
  }

  return streak
}

export function calculateLongestStreak(workouts: Pick<Workout, 'workout_date'>[]): number {
  if (workouts.length === 0) return 0

  // Sort by date ascending
  const sorted = [...workouts].sort(
    (a, b) => parseLocalDate(a.workout_date).getTime() - parseLocalDate(b.workout_date).getTime()
  )

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseLocalDate(sorted[i - 1].workout_date)
    const currDate = parseLocalDate(sorted[i].workout_date)

    const dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (dayDiff > 1) {
      currentStreak = 1
    }
  }

  return longestStreak
}

export function getWorkoutsThisWeek(workouts: Pick<Workout, 'workout_date'>[]): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)

  return workouts.filter((w) => parseLocalDate(w.workout_date) >= startOfWeek).length
}

export function getWorkoutsThisMonth(workouts: Pick<Workout, 'workout_date'>[]): number {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return workouts.filter((w) => parseLocalDate(w.workout_date) >= startOfMonth).length
}

export function getWorkoutsThisYear(workouts: Pick<Workout, 'workout_date'>[]): number {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)

  return workouts.filter((w) => parseLocalDate(w.workout_date) >= startOfYear).length
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return then.toLocaleDateString()
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
