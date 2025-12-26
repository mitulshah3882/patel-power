'use client'

import { motion } from 'framer-motion'

interface StreakFlameProps {
  streak: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showNumber?: boolean
}

export default function StreakFlame({ streak, size = 'md', showNumber = true }: StreakFlameProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  }

  const numberSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl',
  }

  // Determine flame intensity based on streak
  const getFlameEmoji = () => {
    if (streak === 0) return '💨'
    if (streak < 3) return '🔥'
    if (streak < 7) return '🔥'
    if (streak < 30) return '🔥'
    return '🔥'
  }

  // Animation intensity based on streak
  const getAnimationScale = () => {
    if (streak === 0) return [1, 1]
    if (streak < 3) return [1, 1.05]
    if (streak < 7) return [1, 1.1]
    if (streak < 30) return [1, 1.15]
    return [1, 1.2]
  }

  const getAnimationDuration = () => {
    if (streak === 0) return 2
    if (streak < 3) return 1.5
    if (streak < 7) return 1
    if (streak < 30) return 0.7
    return 0.5
  }

  if (streak === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className={`${sizeClasses[size]} opacity-30`}>🔥</span>
        {showNumber && (
          <span className={`${numberSizeClasses[size]} text-gray-400 font-medium`}>0</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <motion.span
        className={sizeClasses[size]}
        animate={{
          scale: getAnimationScale(),
        }}
        transition={{
          duration: getAnimationDuration(),
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        {getFlameEmoji()}
      </motion.span>
      {showNumber && (
        <span className={`${numberSizeClasses[size]} text-orange-600 font-bold`}>{streak}</span>
      )}
      {streak >= 30 && (
        <motion.span
          className={sizeClasses[size]}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          👑
        </motion.span>
      )}
    </div>
  )
}
