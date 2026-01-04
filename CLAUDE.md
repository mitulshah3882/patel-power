# CLAUDE.md - Patel Power

## Project Overview

**Patel Power** is a mobile-first PWA for the Patel family to track workouts together in 2026. The app emphasizes simplicity (for non-tech-savvy family members), fun gamification, and family accountability.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Backend/Auth/DB:** Supabase (email OTP auth, PostgreSQL, real-time subscriptions)
- **Deployment:** Vercel
- **PWA:** next-pwa

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Project Structure

```
/app
  /page.tsx                 # Home/Dashboard
  /leaderboard/page.tsx     # Leaderboard
  /profile/page.tsx         # User profile
  /login/page.tsx           # Email OTP auth page
  /onboarding/page.tsx      # First-time user tutorial
  /layout.tsx               # Root layout with nav
  /globals.css              # Global styles

/components
  /ui                       # Reusable UI components (buttons, cards, etc.)
  /LogWorkoutButton.tsx     # Primary CTA
  /LeaderboardCard.tsx      # User card in leaderboard (clickable)
  /ChallengeCard.tsx        # Progress bar card for challenge tab
  /ProfileModal.tsx         # Slide-up modal for viewing family member profiles
  /ActivityFeed.tsx         # Recent activity
  /BadgeDisplay.tsx         # Badge showcase
  /StreakFlame.tsx          # Animated streak indicator
  /Confetti.tsx             # Celebration animation
  /EmojiPicker.tsx          # Avatar selection
  /OnboardingSlides.tsx     # Tutorial carousel
  /SplashScreen.tsx         # Animated splash screen on app load
  /AppWrapper.tsx           # Client wrapper for splash screen and theme
  /ThemeProvider.tsx        # Dark mode context with system preference detection
  /ThemeToggle.tsx          # Light/dark/system toggle component

/lib
  /supabase.ts              # Supabase client setup
  /hooks.ts                 # Custom hooks (useUser, useWorkouts, useLeaderboard, etc.)
  /utils.ts                 # Helper functions (streak calculation, date formatting)
  /badges.ts                # Badge definitions and award logic

/public
  /icons                    # PWA icons (192x192, 512x512)
  /manifest.json            # PWA manifest
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
```

## Database (Supabase)

Three main tables with Row Level Security enabled:

- **profiles** - User profiles (display_name, avatar_emoji, has_completed_onboarding)
- **workouts** - Workout logs (user_id, workout_date, note) - unique constraint on user_id + workout_date
- **user_badges** - Earned badges (user_id, badge_type, earned_at)

All tables are readable by any authenticated user (family app). Users can only insert/update their own data.

Real-time subscriptions enabled on `workouts` and `profiles` tables.

## Key Design Decisions

### Authentication
- **Email OTP codes** (no passwords) - user enters 8-digit code from email
- OTP flow works in PWA (magic links fail due to iOS storage isolation)
- Persist sessions (90-day refresh token recommended) to minimize re-authentication

### Workouts
- One workout per day maximum (prevents gaming)
- Can post-date up to 7 days back
- Optional note field

### Streaks
- Consecutive days with logged workouts
- Streak breaks if no workout logged yesterday or today
- Visual flame that grows with streak length

### Badges
| Badge | Requirement | Key |
|-------|-------------|-----|
| First Step | Log first workout | `first_step` |
| Week Warrior | 7-day streak | `week_warrior` |
| Consistency Crown | 30-day streak | `consistency_crown` |
| Century Club | 100 total workouts | `century_club` |
| Early Bird | 10 workouts before 8am | `early_bird` |
| Night Owl | 10 workouts after 8pm | `night_owl` |
| New Year Energy | Workout on Jan 1, 2026 | `new_year_energy` |
| Perfect Week | 7 workouts in one week | `perfect_week` |
| Family Inspiration | Longest streak in family | `family_inspiration` |
| Race Winner | First to 24 workouts (competitive) | `race_winner` |
| Race Finisher | Complete 24 workouts | `race_finisher` |

## Code Conventions

### Components
- Use functional components with TypeScript
- Client components should have `'use client'` directive
- Keep components focused and composable

### Styling
- Use Tailwind CSS utilities
- Mobile-first approach (`md:` and `lg:` for larger screens)
- Color palette: orange/coral primary, teal secondary, warm grays
- Dark mode: use `dark:` prefix for dark mode styles (e.g., `dark:bg-gray-900`)
- Theme controlled via class on `<html>` element (`darkMode: 'class'` in Tailwind config)

### Data Fetching
- Use Supabase client from `/lib/supabase.ts`
- Real-time subscriptions for leaderboard and activity feed
- Custom hooks in `/lib/hooks.ts` for data access

### Animations
- Use Framer Motion for all animations
- Confetti on workout log
- Flame animation for streaks
- Smooth page/modal transitions

## MCP Server Usage

### Supabase MCP

The project uses the Supabase MCP server for direct database interaction. This enables querying, schema inspection, and migrations without leaving the development flow.

#### Safety Rules (CRITICAL)

1. **Read-only by default** — Use MCP primarily for:
   - Inspecting schema (`list_tables`, `get_table_info`)
   - Querying data to debug issues
   - Generating TypeScript types
   - Reviewing existing migrations

2. **Destructive operations require explicit approval** — ALWAYS ask before:
   - Running migrations that DROP or ALTER columns
   - DELETE operations on any table
   - TRUNCATE operations
   - Any operation that could cause data loss

3. **Migration safety checklist** — Before applying any migration:
   - [ ] Confirm the migration SQL with the user
   - [ ] Verify it won't break existing data
   - [ ] Check for foreign key implications
   - [ ] Ensure RLS policies are included for new tables

4. **Never run on production without confirmation** — If connected to a production database, always confirm before ANY write operation.

#### When to Use Supabase MCP

| Task | Use MCP | Don't Use MCP |
|------|---------|---------------|
| Check current schema | ✅ | |
| Debug "why is this query slow?" | ✅ | |
| Generate TypeScript types | ✅ | |
| Add a new table with RLS | ✅ (with approval) | |
| Quick data inspection | ✅ | |
| Complex data migrations | | ✅ Use SQL Editor in Dashboard |
| Sensitive data operations | | ✅ Dashboard with audit trail |
| Initial project setup | | ✅ Follow MVP spec SQL |

#### MCP Workflow Patterns

**Pattern 1: Schema-first development**
```
1. User requests new feature
2. Claude uses MCP to inspect current schema
3. Claude proposes migration SQL
4. User approves
5. Claude applies migration via MCP
6. Claude generates updated TypeScript types
```

**Pattern 2: Debugging data issues**
```
1. User reports bug ("photos not showing")
2. Claude queries relevant tables via MCP
3. Claude identifies issue (e.g., status = 'error')
4. Claude proposes fix
```

**Pattern 3: Type synchronization**
```
1. After any schema change
2. Claude uses MCP to introspect current schema
3. Claude updates TypeScript interfaces in /types
4. Ensures app types match database
```

#### Query Guidelines

- Always use `LIMIT` when exploring data (default to 10-20 rows)
- Never `SELECT *` on tables that might contain large BLOBs
- Use `EXPLAIN ANALYZE` for performance debugging
- Prefer reading from `information_schema` for schema introspection

#### What Claude Should Announce

When using Supabase MCP, Claude should clearly state:
- What operation is about to be performed
- Whether it's read-only or will modify data
- Any potential risks or side effects

Example: "I'm going to query the `photos` table to see recent uploads with errors. This is read-only and won't modify any data."

## UX Guidelines

- **Big touch targets** - buttons should be easy to tap on mobile
- **Celebratory feedback** - make logging workouts feel rewarding
- **Simple language** - avoid technical jargon
- **Minimal friction** - reduce steps to complete actions
- Large, readable typography

## Important Notes

1. **Target users are mixed technical ability** - prioritize simplicity over features
2. **Mobile-first** - design for phones, enhance for desktop
3. **Real-time updates** - leaderboard should update live when family members log workouts
4. **PWA installable** - should work great when added to home screen
5. **Onboarding required** - new users must complete 4-step tutorial before using app
