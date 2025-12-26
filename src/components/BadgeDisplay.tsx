'use client'

import { motion } from 'framer-motion'
import { BADGES, getBadgeById, BadgeDefinition } from '@/lib/badges'
import { UserBadge } from '@/lib/types/database'

interface BadgeDisplayProps {
  earnedBadges: UserBadge[]
  showLocked?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function BadgeDisplay({ earnedBadges, showLocked = true, size = 'md' }: BadgeDisplayProps) {
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_type))

  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl',
  }

  const BadgeItem = ({ badge, earned }: { badge: BadgeDefinition; earned: boolean }) => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center"
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
          earned
            ? 'bg-gradient-to-br from-amber-100 to-amber-200 shadow-lg'
            : 'bg-gray-100 grayscale opacity-40'
        }`}
      >
        {badge.emoji}
      </div>
      <span
        className={`mt-1 text-xs font-medium text-center ${
          earned ? 'text-gray-700' : 'text-gray-400'
        }`}
      >
        {badge.name}
      </span>
      {!earned && showLocked && (
        <span className="text-[10px] text-gray-400 text-center max-w-[80px]">
          {badge.requirement}
        </span>
      )}
    </motion.div>
  )

  const displayBadges = showLocked
    ? BADGES
    : BADGES.filter((b) => earnedBadgeIds.has(b.id))

  if (displayBadges.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No badges earned yet. Keep working out!
      </p>
    )
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
      {displayBadges.map((badge) => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          earned={earnedBadgeIds.has(badge.id)}
        />
      ))}
    </div>
  )
}
