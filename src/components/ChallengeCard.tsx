'use client'

import { motion } from 'framer-motion'
import { Profile } from '@/lib/types/database'

interface ChallengeCardProps {
  profile: Profile
  workoutCount: number
  rank: number
  isWinner: boolean
  isFinisher: boolean
  isCurrentUser?: boolean
  onClick?: () => void
}

const CHALLENGE_GOAL = 24

export default function ChallengeCard({
  profile,
  workoutCount,
  rank,
  isWinner,
  isFinisher,
  isCurrentUser = false,
  onClick,
}: ChallengeCardProps) {
  const progress = Math.min(workoutCount / CHALLENGE_GOAL, 1)
  const percentage = Math.round(progress * 100)
  const isCompleted = workoutCount >= CHALLENGE_GOAL

  const getStatusIcon = () => {
    if (isWinner) return <span className="text-2xl">🏆</span>
    if (isFinisher) return <span className="text-2xl">🎖️</span>
    return <span className="text-gray-400 dark:text-gray-500">#{rank}</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`p-4 rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${
        isWinner
          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-400 shadow-lg'
          : isCurrentUser
          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700'
          : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4 mb-3">
        {/* Status icon (trophy, medal, or rank) */}
        <div className="w-10 text-center font-bold text-lg">
          {getStatusIcon()}
        </div>

        {/* Avatar */}
        <div className="text-3xl">{profile.avatar_emoji}</div>

        {/* Name and count */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold truncate ${
            isWinner
              ? 'text-amber-700 dark:text-amber-400'
              : isCurrentUser
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-gray-900 dark:text-white'
          }`}>
            {profile.display_name}
            {isCurrentUser && <span className="text-xs ml-1 text-primary-500 dark:text-primary-400">(You)</span>}
            {isWinner && <span className="text-xs ml-1 text-amber-600 dark:text-amber-400">Winner!</span>}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {workoutCount} / {CHALLENGE_GOAL} workouts
          </p>
        </div>

        {/* Percentage */}
        <div className={`text-lg font-bold ${
          isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
        }`}>
          {percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isCompleted
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : isWinner
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
              : 'bg-gradient-to-r from-primary-400 to-primary-500'
          }`}
        />
      </div>
    </motion.div>
  )
}
