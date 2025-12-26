import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Profile } from '@/lib/types/database'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has completed profile setup
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single<Profile>()

        // If no profile, redirect to complete setup
        if (!profile) {
          return NextResponse.redirect(`${origin}/onboarding?setup=true`)
        }

        // If profile exists but hasn't completed onboarding
        if (!profile.has_completed_onboarding) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to login page on error
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
