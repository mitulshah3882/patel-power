'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile, Workout, UserBadge } from '@/lib/types/database'
import { calculateStreak, calculateLongestStreak } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import BadgeDisplay from '@/components/BadgeDisplay'
import StreakFlame from '@/components/StreakFlame'
import EmojiPicker from '@/components/EmojiPicker'
import { motion, AnimatePresence } from 'framer-motion'
import { PatelPowerIcon } from '@/components/Logo'
import ThemeToggle from '@/components/ThemeToggle'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const [profileRes, workoutsRes, badgesRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('workouts').select('*').eq('user_id', user.id).order('workout_date', { ascending: false }),
      supabase.from('user_badges').select('*').eq('user_id', user.id),
    ])

    if (profileRes.data) {
      setProfile(profileRes.data)
      setEditName(profileRes.data.display_name)
      setEditEmoji(profileRes.data.avatar_emoji)
    }
    if (workoutsRes.data) setWorkouts(workoutsRes.data)
    if (badgesRes.data) setBadges(badgesRes.data)

    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSaveProfile = async () => {
    if (!profile || !editName.trim()) return

    setSaving(true)
    const supabase = createClient()

    await supabase
      .from('profiles')
      .update({
        display_name: editName.trim(),
        avatar_emoji: editEmoji,
      })
      .eq('id', profile.id)

    setProfile({
      ...profile,
      display_name: editName.trim(),
      avatar_emoji: editEmoji,
    })
    setIsEditing(false)
    setSaving(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-bounce">
            <PatelPowerIcon size={64} />
          </div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  const streak = calculateStreak(workouts)
  const longestStreak = calculateLongestStreak(workouts)
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white px-4 pt-12 pb-20 rounded-b-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-4"
              >
                <EmojiPicker selected={editEmoji} onSelect={setEditEmoji} />
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-7xl mb-4"
              >
                {profile?.avatar_emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-2xl font-bold bg-white/20 rounded-xl px-4 py-2 text-center w-full max-w-xs mx-auto text-white placeholder-white/50"
              placeholder="Your name"
            />
          ) : (
            <h1 className="text-2xl font-bold">{profile?.display_name}</h1>
          )}
          <p className="text-primary-100 mt-1">Member since {memberSince}</p>

          <div className="mt-4">
            {isEditing ? (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white/80 hover:text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-white text-primary-600 px-4 py-2 rounded-xl font-medium"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-white/80 hover:text-white text-sm underline"
              >
                Edit Profile
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Workouts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{workouts.length}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Current Streak</p>
              <div className="flex justify-center">
                <StreakFlame streak={streak} size="md" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Longest Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{longestStreak}</p>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Badges</h2>
          <BadgeDisplay earnedBadges={badges} showLocked={true} size="md" />
        </motion.div>

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <ThemeToggle />
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleSignOut}
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
          >
            Sign Out
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
