'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import EmojiPicker from '@/components/EmojiPicker'
import OnboardingSlides from '@/components/OnboardingSlides'
import LogWorkoutButton from '@/components/LogWorkoutButton'
import Confetti from '@/components/Confetti'
import { Profile } from '@/lib/types/database'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const needsSetup = searchParams.get('setup') === 'true'

  const [step, setStep] = useState<'setup' | 'tutorial' | 'first-workout'>(
    needsSetup ? 'setup' : 'tutorial'
  )
  const [displayName, setDisplayName] = useState('')
  const [avatarEmoji, setAvatarEmoji] = useState('💪')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<Profile[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // Check if profile already exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle<Profile>()

        if (profile && !needsSetup) {
          if (profile.has_completed_onboarding) {
            router.push('/')
            return
          }
          setDisplayName(profile.display_name)
          setAvatarEmoji(profile.avatar_emoji)
        }

        // Fetch family members for onboarding display
        const { data: members } = await supabase.from('profiles').select('*').returns<Profile[]>()
        if (members) {
          setFamilyMembers(members.filter((m: Profile) => m.id !== user.id))
        }
      }
    }
    fetchData()
  }, [needsSetup, router])

  const handleProfileSetup = async () => {
    if (!displayName.trim() || !userId) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      avatar_emoji: avatarEmoji,
      has_completed_onboarding: false,
    })

    if (!error) {
      setStep('tutorial')
    }
    setLoading(false)
  }

  const handleTutorialComplete = async (logFirstWorkout: boolean) => {
    if (logFirstWorkout) {
      setStep('first-workout')
    } else {
      await markOnboardingComplete()
    }
  }

  const markOnboardingComplete = async () => {
    if (!userId) return

    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ has_completed_onboarding: true })
      .eq('id', userId)

    router.push('/')
  }

  const handleFirstWorkoutLogged = () => {
    setShowConfetti(true)
    setTimeout(async () => {
      await markOnboardingComplete()
    }, 2000)
  }

  if (step === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Confetti trigger={showConfetti} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Profile</h1>
            <p className="text-gray-600">Let the family know who you are!</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <EmojiPicker selected={avatarEmoji} onSelect={setAvatarEmoji} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your name (how family sees you)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Auntie Priya, Uncle Raj, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-lg"
              />
            </div>

            <button
              onClick={handleProfileSetup}
              disabled={!displayName.trim() || loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (step === 'tutorial') {
    return (
      <OnboardingSlides
        familyMembers={familyMembers}
        onComplete={handleTutorialComplete}
      />
    )
  }

  if (step === 'first-workout') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <Confetti trigger={showConfetti} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ready for your first workout log?
          </h1>
          <p className="text-gray-600 mb-8">Let&apos;s start your fitness journey!</p>

          {userId && (
            <LogWorkoutButton userId={userId} onSuccess={handleFirstWorkoutLogged} />
          )}

          <button
            onClick={markOnboardingComplete}
            className="mt-6 text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </motion.div>
      </div>
    )
  }

  return null
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💪</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
