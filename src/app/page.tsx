'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, Workout } from '@/lib/types/database'
import { calculateStreak, getWorkoutsThisWeek, getWorkoutsThisMonth, formatRelativeTime } from '@/lib/utils'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import BottomNav from '@/components/BottomNav'
import LogWorkoutButton from '@/components/LogWorkoutButton'
import StreakFlame from '@/components/StreakFlame'
import ActivityFeed from '@/components/ActivityFeed'
import Confetti from '@/components/Confetti'
import { motion } from 'framer-motion'

interface ActivityItem {
  id: string
  type: 'workout' | 'streak' | 'badge'
  profile: Profile
  workout?: Workout
  streak?: number
  badge?: string
  timestamp: string
}

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadge, setNewBadge] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    // Fetch user's workouts
    const { data: workoutData } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('workout_date', { ascending: false })

    if (workoutData) {
      setWorkouts(workoutData)
    }

    // Fetch recent family activity
    const { data: recentWorkouts } = await supabase
      .from('workouts')
      .select('*, profiles(*)')
      .order('logged_at', { ascending: false })
      .limit(10)

    if (recentWorkouts) {
      const activityItems: ActivityItem[] = recentWorkouts.map((w: Workout & { profiles: Profile }) => ({
        id: w.id,
        type: 'workout' as const,
        profile: w.profiles,
        workout: w,
        timestamp: w.logged_at,
      }))
      setActivities(activityItems)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('workouts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workouts' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchData])

  const handleWorkoutLogged = async () => {
    await fetchData()

    // Check for new badges
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: badges } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)

    const newBadges = checkNewBadges(workouts, badges || [])
    if (newBadges.length > 0) {
      // Award badges
      for (const badge of newBadges) {
        await supabase.from('user_badges').insert({
          user_id: user.id,
          badge_type: badge,
        })
      }
      setNewBadge(newBadges[0])
      setShowConfetti(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💪</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  const streak = calculateStreak(workouts)
  const weekCount = getWorkoutsThisWeek(workouts)
  const monthCount = getWorkoutsThisMonth(workouts)

  const badgeInfo = newBadge ? getBadgeById(newBadge) : null

  return (
    <div className="min-h-screen pb-20">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Badge earned modal */}
      {newBadge && badgeInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setNewBadge(null)}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-7xl mb-4">{badgeInfo.emoji}</div>
            <h2 className="text-2xl font-bold mb-2">Badge Earned!</h2>
            <p className="text-xl font-medium text-primary-600 mb-2">{badgeInfo.name}</p>
            <p className="text-gray-600 mb-6">{badgeInfo.description}</p>
            <button
              onClick={() => setNewBadge(null)}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              Awesome!
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 pt-12 pb-24 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-primary-100 mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {profile?.display_name}
            <span className="text-3xl">{profile?.avatar_emoji}</span>
          </h1>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="px-4 -mt-16">
        {/* Stats card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-500 text-sm">Current Streak</p>
              <StreakFlame streak={streak} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{weekCount}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-3xl font-bold text-gray-900">{monthCount}</p>
            </div>
          </div>

          <div className="flex justify-center">
            {profile && (
              <LogWorkoutButton userId={profile.id} onSuccess={handleWorkoutLogged} />
            )}
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Family Activity</h2>
          <ActivityFeed activities={activities} />
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
