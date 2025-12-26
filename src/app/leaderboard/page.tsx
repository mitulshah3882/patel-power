'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Workout, UserBadge } from '@/lib/types/database'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisMonth } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import LeaderboardCard from '@/components/LeaderboardCard'
import ProfileModal from '@/components/ProfileModal'
import { motion } from 'framer-motion'
import { PatelPowerIcon } from '@/components/Logo'

type TimeFilter = 'week' | 'month' | 'all'

interface LeaderboardEntry {
  profile: Profile
  workoutCount: number
  streak: number
}

export default function LeaderboardPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TimeFilter>('week')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
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

        switch (filter) {
          case 'week':
            count = getWorkoutsThisWeek(userWorkouts)
            break
          case 'month':
            count = getWorkoutsThisMonth(userWorkouts)
            break
          case 'all':
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
    }

    setLoading(false)
  }, [filter])

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

  const filterOptions: { value: TimeFilter; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ]

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-primary-50 to-white">
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

      {/* Filter tabs */}
      <div className="px-4 py-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="mb-4 animate-bounce flex justify-center">
              <PatelPowerIcon size={64} />
            </div>
            <p className="text-gray-500">Loading leaderboard...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏃</div>
            <p className="text-gray-500">No workouts logged yet!</p>
            <p className="text-gray-400 text-sm">Be the first to get on the board.</p>
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
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
        workouts={selectedProfile ? allWorkouts.filter((w) => w.user_id === selectedProfile.id) : []}
        badges={selectedProfile ? allBadges.filter((b) => b.user_id === selectedProfile.id) : []}
      />

      <BottomNav />
    </div>
  )
}
