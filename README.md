# Patel Power

A mobile-first PWA for the Patel family to track workouts together in 2026. Built with simplicity in mind for family members of all technical abilities.

## Features

- **Magic Link Auth** - Passwordless login via email (no passwords to remember)
- **One-Tap Workout Logging** - Big, satisfying button to log daily workouts
- **Family Leaderboard** - Real-time rankings by week, month, or all-time
- **Streak Tracking** - Animated flame grows with consecutive workout days
- **Badges & Achievements** - Unlock milestones like "Week Warrior" and "Century Club"
- **Activity Feed** - See when family members log workouts
- **Confetti Celebrations** - Because logging a workout should feel rewarding!
- **PWA Support** - Install on your phone's home screen

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Backend/Auth/DB:** Supabase (PostgreSQL + Row Level Security)
- **PWA:** @ducanh2912/next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/patel-power.git
   cd patel-power
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor
   - Or use the Supabase MCP server if configured

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

Three tables with Row Level Security:

- **profiles** - User profiles (display_name, avatar_emoji, onboarding status)
- **workouts** - Workout logs (one per user per day)
- **user_badges** - Earned achievement badges

See `supabase-schema.sql` for the complete schema.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Setup

1. Enable Email auth provider in Authentication > Providers
2. (Optional) Customize magic link email template
3. Ensure RLS policies are in place

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home dashboard
│   ├── login/page.tsx        # Magic link login
│   ├── onboarding/page.tsx   # First-time user tutorial
│   ├── leaderboard/page.tsx  # Family rankings
│   ├── profile/page.tsx      # User profile & badges
│   └── api/auth/callback/    # Auth callback handler
├── components/
│   ├── LogWorkoutButton.tsx  # Primary CTA with modal
│   ├── LeaderboardCard.tsx   # User ranking card
│   ├── ActivityFeed.tsx      # Recent family activity
│   ├── BadgeDisplay.tsx      # Achievement showcase
│   ├── StreakFlame.tsx       # Animated streak indicator
│   ├── Confetti.tsx          # Celebration animation
│   └── ...
└── lib/
    ├── supabase/             # Supabase client utilities
    ├── types/database.ts     # TypeScript types
    ├── utils.ts              # Streak calculations
    └── badges.ts             # Badge definitions
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

This is a family project, but suggestions are welcome! Please open an issue first to discuss changes.

## License

MIT
