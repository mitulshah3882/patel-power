'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Profile, Workout, UserBadge } from '@/lib/types/database'
import { calculateStreak, calculateLongestStreak, formatRelativeTime } from '@/lib/utils'
import BadgeDisplay from './BadgeDisplay'
import StreakFlame from './StreakFlame'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile | null
  workouts: Workout[]
  badges: UserBadge[]
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  workouts,
  badges,
}: ProfileModalProps) {
  if (!profile) return null

  const streak = calculateStreak(workouts)
  const longestStreak = calculateLongestStreak(workouts)
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Sort workouts newest first
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Slide-up modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Content - scrollable */}
            <div className="overflow-y-auto max-h-[calc(85vh-40px)] pb-8">
              {/* Header with avatar and name */}
              <div className="text-center px-4 pb-4">
                <div className="text-6xl mb-2">{profile.avatar_emoji}</div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile.display_name}
                </h2>
                <p className="text-gray-500 text-sm">Member since {memberSince}</p>
              </div>

              {/* Stats grid */}
              <div className="px-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-gray-500 text-xs">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {workouts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Streak</p>
                      <div className="flex justify-center">
                        <StreakFlame streak={streak} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Longest</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {longestStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Badges</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {badges.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges section */}
              <div className="px-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Badges</h3>
                {badges.length > 0 ? (
                  <BadgeDisplay earnedBadges={badges} showLocked={false} size="sm" />
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No badges earned yet
                  </p>
                )}
              </div>

              {/* Workouts list */}
              <div className="px-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Workout History ({workouts.length})
                </h3>
                {sortedWorkouts.length > 0 ? (
                  <div className="space-y-2">
                    {sortedWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-gray-50 rounded-xl p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {new Date(workout.workout_date).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                            {workout.note && (
                              <p className="text-sm text-gray-600 mt-1">
                                {workout.note}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(workout.logged_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No workouts logged yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
