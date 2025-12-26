'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Confetti from './Confetti'

interface LogWorkoutButtonProps {
  userId: string
  onSuccess?: (newBadges?: string[]) => void
}

export default function LogWorkoutButton({ userId, onSuccess }: LogWorkoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Calculate min date (7 days ago)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() - 7)
  const minDateStr = minDate.toISOString().split('T')[0]
  const maxDateStr = new Date().toISOString().split('T')[0]

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase.from('workouts').insert({
      user_id: userId,
      workout_date: selectedDate,
      note: note.trim() || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('You already logged a workout for this date!')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    // Success!
    setShowConfetti(true)
    setLoading(false)
    setIsOpen(false)
    setNote('')
    setSelectedDate(new Date().toISOString().split('T')[0])

    // Check for new badges (simplified - full implementation would be in a server action)
    onSuccess?.()
  }

  return (
    <>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <motion.button
        onClick={() => setIsOpen(true)}
        className="w-full max-w-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xl py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flex items-center justify-center gap-3">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="text-2xl"
          >
            💪
          </motion.span>
          I Worked Out!
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <div
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="text-center mb-6">
                <span className="text-5xl">🎉</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">Log Your Workout!</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When did you work out?
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={minDateStr}
                    max={maxDateStr}
                    className="w-full min-w-0 max-w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-base box-border appearance-none"
                    style={{ WebkitAppearance: 'none' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What did you do? (optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Treadmill, walked 2 miles..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Logging...' : 'Done! 🎉'}
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
