'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Profile } from '@/lib/types/database'
import { PatelPowerIcon } from '@/components/Logo'

interface OnboardingSlidesProps {
  familyMembers: Profile[]
  onComplete: (logFirstWorkout: boolean) => void
}

const slides = [
  {
    title: 'Welcome to Patel Power!',
    emoji: 'logo',
    description: "We're all getting healthier together in 2026",
    showFamily: true,
    button: "Let's go!",
  },
  {
    title: 'Log Your Workouts',
    emoji: '💪',
    description:
      "Tap the button whenever you exercise. Walked the dog? That counts! Yoga? Counts! Gym? Definitely counts! You can log one workout per day.",
    showButton: true,
    button: 'Got it',
  },
  {
    title: 'Build Your Streak',
    emoji: '🔥',
    description:
      "Work out on consecutive days to build a streak. Don't break the chain! Watch your flame grow from 1 day to 7 days to 30+ days!",
    showStreak: true,
    button: "I'm ready",
  },
  {
    title: 'Compete with Family',
    emoji: '🏆',
    description:
      'See how everyone is doing on the leaderboard. Earn badges for hitting milestones!',
    showBadges: true,
    button: 'Start my journey!',
  },
]

export default function OnboardingSlides({ familyMembers, onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const isLastSlide = currentSlide === slides.length - 1
  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mb-6 flex justify-center"
          >
            {slide.emoji === 'logo' ? (
              <PatelPowerIcon size={100} />
            ) : (
              <span className="text-8xl">{slide.emoji}</span>
            )}
          </motion.div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{slide.title}</h1>

          <p className="text-gray-600 text-lg mb-8">{slide.description}</p>

          {slide.showFamily && familyMembers.length > 0 && (
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {familyMembers.slice(0, 8).map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 text-2xl bg-white rounded-full shadow flex items-center justify-center"
                >
                  {member.avatar_emoji}
                </motion.div>
              ))}
            </div>
          )}

          {slide.showButton && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="mb-8"
            >
              <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg">
                💪 I Worked Out!
              </div>
            </motion.div>
          )}

          {slide.showStreak && (
            <div className="flex justify-center items-center gap-6 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl">🔥</div>
                <div className="text-sm text-gray-500">1 day</div>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-5xl">🔥</div>
                <div className="text-sm text-gray-500">7 days</div>
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="text-6xl">🔥👑</div>
                <div className="text-sm text-gray-500">30+ days</div>
              </motion.div>
            </div>
          )}

          {slide.showBadges && (
            <div className="flex justify-center gap-4 mb-8">
              {['👟', '🗓️', '👑'].map((emoji, i) => (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 * i }}
                  className="w-14 h-14 text-2xl bg-gradient-to-br from-amber-100 to-amber-200 rounded-full shadow-lg flex items-center justify-center"
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          )}

          {!isLastSlide ? (
            <button
              onClick={nextSlide}
              className="w-full max-w-xs bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
            >
              {slide.button} →
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => onComplete(true)}
                className="w-full max-w-xs bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg"
              >
                Log my first workout! 💪
              </button>
              <button
                onClick={() => onComplete(false)}
                className="w-full max-w-xs text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
