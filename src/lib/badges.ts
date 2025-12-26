import { Workout, UserBadge } from './types/database'
import { calculateStreak, calculateLongestStreak } from './utils'

export interface BadgeDefinition {
  id: string
  name: string
  emoji: string
  description: string
  requirement: string
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_step',
    name: 'First Step',
    emoji: '👟',
    description: 'You started your fitness journey!',
    requirement: 'Log first workout',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    emoji: '🗓️',
    description: 'One week of dedication!',
    requirement: '7-day streak',
  },
  {
    id: 'consistency_crown',
    name: 'Consistency Crown',
    emoji: '👑',
    description: 'A whole month of consistency!',
    requirement: '30-day streak',
  },
  {
    id: 'century_club',
    name: 'Century Club',
    emoji: '💯',
    description: 'Triple digits!',
    requirement: '100 total workouts',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    emoji: '🌅',
    description: 'The early bird gets fit!',
    requirement: '10 workouts before 8am',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    emoji: '🦉',
    description: 'Burning the midnight oil!',
    requirement: '10 workouts after 8pm',
  },
  {
    id: 'new_year_energy',
    name: 'New Year Energy',
    emoji: '🎆',
    description: 'Starting the year right!',
    requirement: 'Log workout on Jan 1, 2026',
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    emoji: '⭐',
    description: 'Every single day this week!',
    requirement: '7 workouts in one week',
  },
  {
    id: 'family_inspiration',
    name: 'Family Inspiration',
    emoji: '🏆',
    description: 'Leading by example!',
    requirement: 'Longest streak in the family',
  },
]

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id)
}

export function checkNewBadges(
  workouts: Workout[],
  currentBadges: UserBadge[],
  allFamilyWorkouts?: Map<string, Workout[]>
): string[] {
  const earnedBadgeIds = new Set(currentBadges.map((b) => b.badge_type))
  const newBadges: string[] = []

  // First Step - log first workout
  if (workouts.length >= 1 && !earnedBadgeIds.has('first_step')) {
    newBadges.push('first_step')
  }

  // Week Warrior - 7-day streak
  const currentStreak = calculateStreak(workouts)
  if (currentStreak >= 7 && !earnedBadgeIds.has('week_warrior')) {
    newBadges.push('week_warrior')
  }

  // Consistency Crown - 30-day streak
  if (currentStreak >= 30 && !earnedBadgeIds.has('consistency_crown')) {
    newBadges.push('consistency_crown')
  }

  // Century Club - 100 total workouts
  if (workouts.length >= 100 && !earnedBadgeIds.has('century_club')) {
    newBadges.push('century_club')
  }

  // Early Bird - 10 workouts before 8am
  const earlyWorkouts = workouts.filter((w) => {
    const hour = new Date(w.logged_at).getHours()
    return hour < 8
  })
  if (earlyWorkouts.length >= 10 && !earnedBadgeIds.has('early_bird')) {
    newBadges.push('early_bird')
  }

  // Night Owl - 10 workouts after 8pm
  const nightWorkouts = workouts.filter((w) => {
    const hour = new Date(w.logged_at).getHours()
    return hour >= 20
  })
  if (nightWorkouts.length >= 10 && !earnedBadgeIds.has('night_owl')) {
    newBadges.push('night_owl')
  }

  // New Year Energy - workout on Jan 1, 2026
  const newYearWorkout = workouts.find((w) => {
    const date = new Date(w.workout_date)
    return date.getFullYear() === 2026 && date.getMonth() === 0 && date.getDate() === 1
  })
  if (newYearWorkout && !earnedBadgeIds.has('new_year_energy')) {
    newBadges.push('new_year_energy')
  }

  // Perfect Week - 7 workouts in one calendar week
  if (!earnedBadgeIds.has('perfect_week')) {
    const workoutsByWeek = new Map<string, number>()
    workouts.forEach((w) => {
      const date = new Date(w.workout_date)
      const startOfWeek = new Date(date)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)
      const weekKey = startOfWeek.toISOString().split('T')[0]
      workoutsByWeek.set(weekKey, (workoutsByWeek.get(weekKey) || 0) + 1)
    })
    const hasPerfectWeek = Array.from(workoutsByWeek.values()).some((count) => count >= 7)
    if (hasPerfectWeek) {
      newBadges.push('perfect_week')
    }
  }

  // Family Inspiration - longest streak in family (needs all family data)
  if (allFamilyWorkouts && !earnedBadgeIds.has('family_inspiration')) {
    let userLongestStreak = calculateLongestStreak(workouts)
    let isLongest = true

    allFamilyWorkouts.forEach((familyWorkouts, memberId) => {
      if (memberId !== workouts[0]?.user_id) {
        const memberStreak = calculateLongestStreak(familyWorkouts)
        if (memberStreak >= userLongestStreak) {
          isLongest = false
        }
      }
    })

    if (isLongest && userLongestStreak > 0) {
      newBadges.push('family_inspiration')
    }
  }

  return newBadges
}
