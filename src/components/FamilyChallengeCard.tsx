'use client'

import { motion } from 'framer-motion'

interface Contribution {
  name: string
  emoji: string
  count: number
}

interface FamilyChallengeCardProps {
  title: string
  description: string
  emoji: string
  currentCount: number
  goal: number
  isComplete: boolean
  contributions?: Contribution[]
}

export default function FamilyChallengeCard({
  title,
  description,
  emoji,
  currentCount,
  goal,
  isComplete,
  contributions,
}: FamilyChallengeCardProps) {
  const progress = Math.min(currentCount / goal, 1)
  const percentage = Math.round(progress * 100)
  const remaining = Math.max(goal - currentCount, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl ${
        isComplete
          ? 'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 border-2 border-teal-400 shadow-lg'
          : 'bg-white dark:bg-gray-800 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>

      {/* Big centered count */}
      <div className="text-center mb-4">
        <span className={`text-4xl font-bold ${
          isComplete ? 'text-teal-600 dark:text-teal-400' : 'text-gray-900 dark:text-white'
        }`}>
          {currentCount}
        </span>
        <span className="text-2xl text-gray-400 dark:text-gray-500"> / {goal}</span>
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-teal-400 to-emerald-500'
              : 'bg-gradient-to-r from-teal-400 to-teal-500'
          }`}
        />
      </div>

      {/* Status text */}
      <p className={`text-center text-sm font-medium mb-4 ${
        isComplete ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'
      }`}>
        {isComplete ? '🎉 Challenge Complete!' : `${remaining} more to go — keep it up!`}
      </p>

      {/* Per-person contributions */}
      {contributions && contributions.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          {contributions.map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.emoji}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
              </div>
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                {c.count} workouts
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
