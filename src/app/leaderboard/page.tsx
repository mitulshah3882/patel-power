'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Workout, UserBadge } from '@/lib/types/database'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisYear } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import LeaderboardCard from '@/components/LeaderboardCard'
import ChallengeCard from '@/components/ChallengeCard'
import ProfileModal from '@/components/ProfileModal'
import { motion } from 'framer-motion'
import { PatelPowerIcon } from '@/components/Logo'

type ViewMode = 'week' | 'year' | 'challenge'

interface LeaderboardEntry {
  profile: Profile
  workoutCount: number
  streak: number
}

interface ChallengeEntry {
  profile: Profile
  workoutCount: number
  isWinner: boolean
  isFinisher: boolean
}

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [challengeEntries, setChallengeEntries] = useState<ChallengeEntry[]>([])
  const [loading, setLoading] = useState(true)

  // State for profile modal
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])
  const [allBadges, setAllBadges] = useState<UserBadge[]>([])

  const fetchLeaderboard = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }

    // Fetch all profiles
    const { data: profiles } = await supabase.from('profiles').select('*').returns<Profile[]>()

    // Check if current user is admin
    if (user && profiles) {
      const currentProfile = profiles.find(p => p.id === user.id)
      setIsCurrentUserAdmin(currentProfile?.is_admin ?? false)
    }

    // Fetch all workouts
    const { data: workouts } = await supabase.from('workouts').select('*').returns<Workout[]>()

    // Fetch all badges for profile modal
    const { data: badges } = await supabase.from('user_badges').select('*').returns<UserBadge[]>()

    // Store for profile modal
    if (workouts) setAllWorkouts(workouts)
    if (badges) setAllBadges(badges)

    if (profiles && workouts) {
      const entriesMap = new Map<string, LeaderboardEntry>()

      profiles.forEach((profile: Profile) => {
        const userWorkouts = workouts.filter((w: Workout) => w.user_id === profile.id)
        let count = 0

        switch (viewMode) {
          case 'week':
            count = getWorkoutsThisWeek(userWorkouts)
            break
          case 'year':
            count = getWorkoutsThisYear(userWorkouts)
            break
          case 'challenge':
            count = userWorkouts.length
            break
        }

        entriesMap.set(profile.id, {
          profile,
          workoutCount: count,
          streak: calculateStreak(userWorkouts),
        })
      })

      const sortedEntries = Array.from(entriesMap.values()).sort(
        (a, b) => b.workoutCount - a.workoutCount || b.streak - a.streak
      )

      setEntries(sortedEntries)

      // Compute challenge entries
      if (badges) {
        const challengeData: ChallengeEntry[] = profiles.map((profile: Profile) => {
          const userWorkouts = workouts.filter((w: Workout) => w.user_id === profile.id)
          const userBadges = badges.filter((b: UserBadge) => b.user_id === profile.id)

          return {
            profile,
            workoutCount: userWorkouts.length,
            isWinner: userBadges.some((b) => b.badge_type === 'race_winner'),
            isFinisher: userBadges.some((b) => b.badge_type === 'race_finisher'),
          }
        })

        // Sort: winner first, then by workout count descending
        challengeData.sort((a, b) => {
          if (a.isWinner && !b.isWinner) return -1
          if (!a.isWinner && b.isWinner) return 1
          return b.workoutCount - a.workoutCount
        })

        setChallengeEntries(challengeData)
      }
    }

    setLoading(false)
  }, [viewMode])

  useEffect(() => {
    fetchLeaderboard()

    // Real-time updates
    const supabase = createClient()
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workouts' },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchLeaderboard])

  const viewOptions: { value: ViewMode; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'year', label: 'This Year' },
    { value: 'challenge', label: 'Challenge' },
  ]

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🏆 Leaderboard
          </h1>
          <p className="text-primary-100 mt-1">See how the family is doing!</p>
        </motion.div>
      </div>

      {/* View mode tabs */}
      <div className="px-4 py-4">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
          {viewOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setViewMode(option.value)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                viewMode === option.value
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard / Challenge View */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="mb-4 animate-bounce flex justify-center">
              <PatelPowerIcon size={64} />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : viewMode === 'challenge' ? (
          // Challenge View
          challengeEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏃</div>
              <p className="text-gray-500 dark:text-gray-400">No participants yet!</p>
            </div>
          ) : (
            <>
              {/* Challenge Header */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  🏁 Race to 24 Workouts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  First to complete 24 workouts wins the trophy!
                </p>
              </div>
              {challengeEntries.map((entry, index) => (
                <ChallengeCard
                  key={entry.profile.id}
                  profile={entry.profile}
                  workoutCount={entry.workoutCount}
                  rank={index + 1}
                  isWinner={entry.isWinner}
                  isFinisher={entry.isFinisher}
                  isCurrentUser={entry.profile.id === currentUserId}
                  onClick={() => setSelectedProfile(entry.profile)}
                />
              ))}
            </>
          )
        ) : (
          // Standard Leaderboard View
          entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏃</div>
              <p className="text-gray-500 dark:text-gray-400">No workouts logged yet!</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Be the first to get on the board.</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <LeaderboardCard
                key={entry.profile.id}
                profile={entry.profile}
                rank={index + 1}
                workoutCount={entry.workoutCount}
                streak={entry.streak}
                isCurrentUser={entry.profile.id === currentUserId}
                onClick={() => setSelectedProfile(entry.profile)}
              />
            ))
          )
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
        workouts={selectedProfile ? allWorkouts.filter((w) => w.user_id === selectedProfile.id) : []}
        badges={selectedProfile ? allBadges.filter((b) => b.user_id === selectedProfile.id) : []}
        isAdmin={isCurrentUserAdmin}
        onWorkoutUpdated={fetchLeaderboard}
      />

      <BottomNav />
    </div>
  )
}
