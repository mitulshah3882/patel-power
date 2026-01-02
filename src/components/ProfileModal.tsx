'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Profile, Workout, UserBadge } from '@/lib/types/database'
import { calculateStreak, calculateLongestStreak, formatRelativeTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import BadgeDisplay from './BadgeDisplay'
import StreakFlame from './StreakFlame'

// Inline icon components
const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Profile | null
  workouts: Workout[]
  badges: UserBadge[]
  isAdmin?: boolean
  onWorkoutUpdated?: () => void
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  workouts,
  badges,
  isAdmin = false,
  onWorkoutUpdated,
}: ProfileModalProps) {
  // State for edit/delete modals
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!profile) return null

  // Handler to open edit modal
  const handleEditClick = (workout: Workout) => {
    setEditDate(workout.workout_date)
    setEditNote(workout.note || '')
    setError(null)
    setEditingWorkout(workout)
  }

  // Save edited workout
  const handleSaveEdit = async () => {
    if (!editingWorkout) return

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('workouts')
      .update({
        workout_date: editDate,
        note: editNote.trim() || null,
      })
      .eq('id', editingWorkout.id)

    if (updateError) {
      if (updateError.code === '23505') {
        setError('A workout already exists for this date!')
      } else {
        setError(updateError.message)
      }
      setLoading(false)
      return
    }

    setLoading(false)
    setEditingWorkout(null)
    onWorkoutUpdated?.()
  }

  // Delete workout
  const handleDelete = async () => {
    if (!deletingWorkout) return

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', deletingWorkout.id)

    if (deleteError) {
      setError(deleteError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setDeletingWorkout(null)
    onWorkoutUpdated?.()
  }

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
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl max-h-[85vh] overflow-hidden"
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.display_name}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Member since {memberSince}</p>
              </div>

              {/* Stats grid */}
              <div className="px-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {workouts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Streak</p>
                      <div className="flex justify-center">
                        <StreakFlame streak={streak} size="sm" />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Longest</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {longestStreak}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Badges</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {badges.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badges section */}
              <div className="px-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Badges</h3>
                {badges.length > 0 ? (
                  <BadgeDisplay earnedBadges={badges} showLocked={false} size="sm" />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No badges earned yet
                  </p>
                )}
              </div>

              {/* Workouts list */}
              <div className="px-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Workout History ({workouts.length})
                </h3>
                {sortedWorkouts.length > 0 ? (
                  <div className="space-y-2">
                    {sortedWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white">
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
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                                {workout.note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatRelativeTime(workout.logged_at)}
                            </span>
                            {isAdmin && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditClick(workout)}
                                  className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                  aria-label="Edit workout"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingWorkout(workout)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  aria-label="Delete workout"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No workouts logged yet
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Edit Workout Modal */}
          <AnimatePresence>
            {editingWorkout && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-[60]"
                  onClick={() => setEditingWorkout(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 50 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                  onClick={() => setEditingWorkout(null)}
                >
                  <div
                    className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center mb-6">
                      <span className="text-5xl">✏️</span>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        Edit Workout
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Editing for {profile?.display_name}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Workout Date
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Note (optional)
                        </label>
                        <input
                          type="text"
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="What did they do?"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                      </div>

                      {error && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl"
                        >
                          {error}
                        </motion.p>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingWorkout(null)}
                          className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={loading}
                          className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deletingWorkout && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-[60]"
                  onClick={() => setDeletingWorkout(null)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                  onClick={() => setDeletingWorkout(null)}
                >
                  <div
                    className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-5xl">🗑️</span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
                      Delete Workout?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                      This will remove the workout from{' '}
                      <span className="font-medium">{profile?.display_name}&apos;s</span> history.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(deletingWorkout.workout_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>

                    {error && (
                      <p className="text-red-500 text-sm mt-3">{error}</p>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setDeletingWorkout(null)}
                        className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
