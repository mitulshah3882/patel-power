'use client'

import { motion } from 'framer-motion'
import { formatRelativeTime } from '@/lib/utils'
import { Profile, Workout } from '@/lib/types/database'

interface ActivityItem {
  id: string
  type: 'workout' | 'streak' | 'badge'
  profile: Profile
  workout?: Workout
  streak?: number
  badge?: string
  timestamp: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <span className="text-4xl block mb-2">🏃</span>
        <p>No recent activity yet.</p>
        <p className="text-sm">Be the first to log a workout!</p>
      </div>
    )
  }

  const getActivityMessage = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'workout':
        return (
          <>
            <span className="font-medium">{activity.profile.display_name}</span> logged a workout{' '}
            {activity.workout?.note && (
              <span className="text-gray-500 dark:text-gray-400">({activity.workout.note})</span>
            )}
          </>
        )
      case 'streak':
        return (
          <>
            <span className="font-medium">{activity.profile.display_name}</span> hit a{' '}
            {activity.streak}-day streak! 🔥
          </>
        )
      case 'badge':
        return (
          <>
            <span className="font-medium">{activity.profile.display_name}</span> earned a badge!
          </>
        )
      default:
        return null
    }
  }

  const getActivityEmoji = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'workout':
        return '🎉'
      case 'streak':
        return '🔥'
      case 'badge':
        return '🏆'
      default:
        return '💪'
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
        >
          <div className="text-2xl flex-shrink-0">{activity.profile.avatar_emoji}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200">{getActivityMessage(activity)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatRelativeTime(activity.timestamp)} {getActivityEmoji(activity)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
