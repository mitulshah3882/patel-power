'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PatelPowerIcon } from '@/components/Logo'
import Link from 'next/link'

export default function AuthHelpPage() {
  const router = useRouter()

  // Auto-redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login')
    }, 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-primary-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-4">
          <PatelPowerIcon size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Link expired or invalid
        </h1>
        <p className="text-gray-600 mb-6">
          No worries! Go back to the login page and enter the code from your email instead.
        </p>

        <Link
          href="/login"
          className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Go to Login
        </Link>

        <p className="text-gray-400 text-sm mt-4">
          Redirecting automatically...
        </p>
      </motion.div>
    </div>
  )
}
