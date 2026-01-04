'use client'

import { motion } from 'framer-motion'
import StreakFlame from './StreakFlame'
import { Profile } from '@/lib/types/database'

interface LeaderboardCardProps {
  profile: Profile
  rank: number
  workoutCount: number
  streak: number
  isCurrentUser?: boolean
  onClick?: () => void
}

export default function LeaderboardCard({
  profile,
  rank,
  workoutCount,
  streak,
  isCurrentUser = false,
  onClick,
}: LeaderboardCardProps) {
  const getRankDisplay = () => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${
        isCurrentUser
          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-700'
          : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="w-10 text-center font-bold text-lg">
        {rank <= 3 ? (
          <span className="text-2xl">{getRankDisplay()}</span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500">{getRankDisplay()}</span>
        )}
      </div>

      <div className="text-3xl">{profile.avatar_emoji}</div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isCurrentUser ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
          {profile.display_name}
          {isCurrentUser && <span className="text-xs ml-1 text-primary-500 dark:text-primary-400">(You)</span>}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-shrink-0">
        <StreakFlame streak={streak} size="sm" />
      </div>
    </motion.div>
  )
}
