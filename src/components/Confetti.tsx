'use client'

import { useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

export default function Confetti({ trigger, onComplete }: ConfettiProps) {
  const fireConfetti = useCallback(() => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        onComplete?.()
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti from multiple angles
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#f97316', '#14b8a6', '#fbbf24', '#ef4444', '#8b5cf6'],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#f97316', '#14b8a6', '#fbbf24', '#ef4444', '#8b5cf6'],
      })
    }, 250)
  }, [onComplete])

  useEffect(() => {
    if (trigger) {
      fireConfetti()
    }
  }, [trigger, fireConfetti])

  return null
}
