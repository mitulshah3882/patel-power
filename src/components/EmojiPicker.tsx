'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AVATAR_EMOJIS = [
  '💪', '🏃', '🧘', '🏋️', '🚴', '🏊', '⚽', '🏀',
  '🎾', '🥊', '🧗', '🤸', '🏄', '⛷️', '🎯', '🏆',
  '🌟', '🔥', '💫', '✨', '🦸', '🦹', '🐯', '🦁',
  '🐻', '🐼', '🦊', '🐨', '🦄', '🐉', '🌈', '☀️',
]

interface EmojiPickerProps {
  selected: string
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 h-24 text-5xl bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border-4 border-primary-200 hover:border-primary-400"
      >
        {selected}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 z-50 w-72"
            >
              <p className="text-sm text-gray-500 mb-3 text-center">Choose your avatar</p>
              <div className="grid grid-cols-8 gap-1">
                {AVATAR_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSelect(emoji)
                      setIsOpen(false)
                    }}
                    className={`w-8 h-8 text-xl rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center ${
                      selected === emoji ? 'bg-primary-200' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
