# Patel Power 💪

## Project Overview

Build a mobile-first web app (PWA) called **Patel Power** for the Patel family to track workouts together in 2026. The app should be visually appealing, fun, and dead-simple to use — especially for family members who aren't technically savvy.

**Tech Stack:**
- **Frontend:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Backend/Auth/Database:** Supabase
- **Deployment:** Vercel
- **PWA:** next-pwa or similar

**Target Users:** 7-15 family members, mixed technical abilities, primarily mobile users

---

## Core Features

### 1. Authentication (Keep It Simple!)

Use **Supabase Magic Links** (email-based, passwordless auth):
- User enters email → receives a login link → clicks it → logged in
- No passwords to remember (critical for older family members)
- Persist sessions so they rarely need to re-authenticate

**First-time setup flow:**
1. Enter email
2. Click magic link in email
3. Set display name + pick an avatar/emoji
4. Onboarding tutorial (see below)
5. Done!

### First-Time User Onboarding

After profile creation, new users see a friendly 4-step walkthrough. Use a modal/overlay or full-screen cards they can swipe through.

**Step 1: Welcome**
- "Welcome to Patel Power! 💪"
- "We're all getting healthier together in 2026"
- Show family member avatars in a row (people already signed up)
- Button: "Let's go! →"

**Step 2: Log Your Workouts**
- "Tap this button whenever you exercise 💪"
- Show the "I Worked Out!" button with a subtle animation/pulse
- "Walked the dog? That counts! Yoga? Counts! Gym? Definitely counts!"
- "You can log one workout per day"
- Button: "Got it →"

**Step 3: Build Your Streak**
- "Work out on consecutive days to build a streak 🔥"
- Show example: animated flame growing from 1 day → 3 days → 7 days
- "Don't break the chain!"
- Button: "I'm ready →"

**Step 4: Compete with Family**
- "See how everyone's doing on the leaderboard 🏆"
- Show mini preview of leaderboard with family members
- "Earn badges for hitting milestones"
- Show a few badge examples (👟 First Step, 🗓️ Week Warrior, 👑 30-Day Streak)
- Button: "Start my journey!"

**After onboarding:**
- Immediately prompt: "Want to log your first workout now?"
- If yes → open log workout flow → celebrate with confetti + "First Step" badge
- If no → go to home screen

**Implementation notes:**
- Store `has_completed_onboarding: boolean` in the profiles table
- Only show onboarding once (but add a "How it works" link in settings to replay)
- Keep it short — 4 screens max, skippable but encouraged
- Use friendly, casual language
- Animations make it feel polished (use Framer Motion for slide transitions)

### 2. User Profiles

Each user has:
- Display name (e.g., "Auntie Priya")
- Avatar (emoji picker or simple avatar selection — keep it fun!)
- Join date
- Stats summary (total workouts, current streak, longest streak)

### 3. Log a Workout

**Primary action — make this prominent and satisfying!**

- Big, friendly "I Worked Out!" button on the home screen
- Defaults to today's date
- Optional: date picker to log past workouts (post-date up to 7 days back)
- Optional: quick note field ("Morning yoga", "Walked 2 miles")
- Celebratory animation/confetti on submission!
- Only ONE workout per day counts (prevent gaming the system)

### 4. Family Leaderboard

Show family members ranked by:
- **This Week:** Workouts logged in the current week (Mon-Sun)
- **This Month:** Workouts logged in the current month
- **All Time:** Total workouts since joining

Display for each person:
- Avatar + Name
- Workout count for the selected period
- Current streak (🔥 with flame emoji)
- Fun rank badges (🥇🥈🥉 for top 3)

**Real-time updates** using Supabase subscriptions — when someone logs a workout, everyone sees it update live!

### 5. Gamification

#### Streaks
- Track consecutive days with workouts
- Show current streak prominently on profile and leaderboard
- Streak freezes at midnight (user's local time)
- Visual flame that grows with longer streaks (3 days = small flame, 7+ = big flame, 30+ = inferno!)

#### Badges/Achievements
Award badges for milestones:

| Badge | Requirement | Emoji |
|-------|-------------|-------|
| First Step | Log first workout | 👟 |
| Week Warrior | 7-day streak | 🗓️ |
| Consistency King/Queen | 30-day streak | 👑 |
| Century Club | 100 total workouts | 💯 |
| Early Bird | Log 10 workouts before 8am | 🌅 |
| Night Owl | Log 10 workouts after 8pm | 🦉 |
| New Year Energy | Log workout on Jan 1, 2026 | 🎆 |
| Perfect Week | 7 workouts in one week | ⭐ |
| Family Inspiration | Have the longest streak in the family | 🏆 |

Display earned badges on profile. Show locked badges greyed out with requirements.

#### Weekly Challenges (Optional but Fun)
- "The family collectively logs 30 workouts this week"
- Progress bar showing family's combined progress
- Celebration when goal is hit!

### 6. Activity Feed

Simple feed showing recent family activity:
- "Auntie Priya logged a workout 🎉" — 2 hours ago
- "Uncle Raj hit a 7-day streak! 🔥" — 5 hours ago
- "Dad earned the Week Warrior badge! 🗓️" — 1 day ago

Keeps everyone engaged and aware of each other's progress.

---

## Database Schema (Supabase)

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_emoji text default '💪',
  has_completed_onboarding boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles are viewable by all authenticated users (it's a family app!)
create policy "Profiles are viewable by authenticated users" 
  on public.profiles for select 
  using (auth.role() = 'authenticated');

-- Users can update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

---

-- Workouts table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  workout_date date not null,
  note text,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate workouts on same day
  unique(user_id, workout_date)
);

-- Enable RLS
alter table public.workouts enable row level security;

-- Workouts are viewable by all authenticated users
create policy "Workouts are viewable by authenticated users" 
  on public.workouts for select 
  using (auth.role() = 'authenticated');

-- Users can insert their own workouts
create policy "Users can insert own workouts" 
  on public.workouts for insert 
  with check (auth.uid() = user_id);

-- Users can delete their own workouts (in case of mistakes)
create policy "Users can delete own workouts" 
  on public.workouts for delete 
  using (auth.uid() = user_id);

---

-- Badges table (tracks earned badges)
create table public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  badge_type text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id, badge_type)
);

-- Enable RLS
alter table public.user_badges enable row level security;

-- Badges are viewable by all authenticated users
create policy "Badges are viewable by authenticated users" 
  on public.user_badges for select 
  using (auth.role() = 'authenticated');

-- System inserts badges (via function/trigger or API)
create policy "Users can insert own badges" 
  on public.user_badges for insert 
  with check (auth.uid() = user_id);

---

-- Enable realtime for workouts
alter publication supabase_realtime add table public.workouts;
alter publication supabase_realtime add table public.profiles;
```

---

## UI/UX Guidelines

### Design Principles
1. **Mobile-first:** Design for phones, enhance for desktop
2. **Big touch targets:** Buttons should be easy to tap
3. **Celebratory:** Make logging a workout feel rewarding!
4. **Scannable:** Leaderboard and stats should be glanceable
5. **Family-friendly:** Warm, encouraging, fun

### Color Palette (Suggestion)
- **Primary:** Vibrant orange or coral (energetic, warm)
- **Secondary:** Teal or green (fresh, healthy)
- **Background:** Light warm grey or off-white
- **Accents:** Gold for achievements, red/orange for streaks

### Typography
- Clean, rounded sans-serif (Inter, Nunito, or Poppins)
- Large, readable text (especially for older users)

### Key Screens

1. **Home (Dashboard)**
   - Greeting: "Hey [Name]! 👋"
   - Big "Log Workout" button (primary CTA)
   - Current streak display
   - Quick stats (workouts this week, month)
   - Recent family activity feed

2. **Leaderboard**
   - Toggle: This Week / This Month / All Time
   - Ranked list with avatars, names, workout counts, streaks
   - Highlight current user's position

3. **Profile**
   - Avatar + Name (editable)
   - Stats: Total workouts, current streak, longest streak, member since
   - Badge showcase (earned + locked)

4. **Log Workout Modal/Page**
   - Date picker (default: today, allow past 7 days)
   - Optional note field
   - Big "Done!" button
   - Confetti/celebration animation on success

### Animations & Micro-interactions
- Confetti burst when logging a workout
- Flame animation for streaks
- Badge unlock animation
- Smooth page transitions
- Button press feedback

Consider using **Framer Motion** for animations.

---

## PWA Configuration

Make it installable on phones:
- Add manifest.json with app name, icons, theme color
- Service worker for offline support (at minimum, show cached data)
- "Add to Home Screen" prompt
- App icon that looks good on home screen

---

## Project Structure (Suggested)

```
/app
  /page.tsx                 # Home/Dashboard
  /leaderboard/page.tsx     # Leaderboard
  /profile/page.tsx         # User profile
  /login/page.tsx           # Auth page
  /onboarding/page.tsx      # First-time user tutorial
  /layout.tsx               # Root layout with nav
  /globals.css              # Global styles
  
/components
  /ui                       # Reusable UI components
  /LogWorkoutButton.tsx     # Primary CTA
  /LeaderboardCard.tsx      # User card in leaderboard
  /ActivityFeed.tsx         # Recent activity
  /BadgeDisplay.tsx         # Badge showcase
  /StreakFlame.tsx          # Animated streak indicator
  /Confetti.tsx             # Celebration animation
  /EmojiPicker.tsx          # Avatar selection
  /OnboardingSlides.tsx     # Tutorial carousel/slides
  
/lib
  /supabase.ts              # Supabase client
  /hooks.ts                 # Custom hooks (useUser, useWorkouts, etc.)
  /utils.ts                 # Helper functions (streak calc, etc.)
  /badges.ts                # Badge definitions and logic
  
/public
  /icons                    # PWA icons
  /manifest.json            # PWA manifest
```

---

## Implementation Notes

### Streak Calculation
Calculate streaks on the client or via a Supabase function:
```typescript
function calculateStreak(workouts: { workout_date: string }[]): number {
  if (workouts.length === 0) return 0;
  
  // Sort by date descending
  const sorted = [...workouts].sort((a, b) => 
    new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mostRecent = new Date(sorted[0].workout_date);
  mostRecent.setHours(0, 0, 0, 0);
  
  // Streak only counts if most recent workout is today or yesterday
  if (mostRecent < yesterday) return 0;
  
  let streak = 1;
  let currentDate = mostRecent;
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    const workoutDate = new Date(sorted[i].workout_date);
    workoutDate.setHours(0, 0, 0, 0);
    
    if (workoutDate.getTime() === prevDate.getTime()) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }
  
  return streak;
}
```

### Real-time Updates
Subscribe to workout inserts to update leaderboard live:
```typescript
supabase
  .channel('workouts')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'workouts' 
  }, payload => {
    // Refresh leaderboard data
  })
  .subscribe();
```

### Badge Checking
Check and award badges after each workout:
```typescript
async function checkAndAwardBadges(userId: string) {
  const workouts = await getUserWorkouts(userId);
  const currentBadges = await getUserBadges(userId);
  
  const newBadges = [];
  
  // First workout
  if (workouts.length >= 1 && !hasBadge(currentBadges, 'first_step')) {
    newBadges.push('first_step');
  }
  
  // 7-day streak
  const streak = calculateStreak(workouts);
  if (streak >= 7 && !hasBadge(currentBadges, 'week_warrior')) {
    newBadges.push('week_warrior');
  }
  
  // ... check other badges
  
  // Insert new badges
  for (const badge of newBadges) {
    await supabase.from('user_badges').insert({ user_id: userId, badge_type: badge });
  }
  
  return newBadges; // Return for celebration UI
}
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Deployment Checklist

1. [ ] Create Supabase project
2. [ ] Run database schema SQL
3. [ ] Enable email auth in Supabase (magic links)
4. [ ] Configure email templates in Supabase (optional: customize)
5. [ ] Deploy to Vercel
6. [ ] Set environment variables in Vercel
7. [ ] Test magic link auth flow
8. [ ] Test PWA installation on phone
9. [ ] Invite family members!

---

## Nice-to-Haves (Future Enhancements)

- Push notifications ("Don't break your streak!")
- Workout type selection (cardio, strength, yoga, walk, etc.)
- Photo uploads with workouts
- Weekly email digest to family
- Year-end stats/wrapped
- Dark mode

---

## Claude Code Prompt

Use this prompt to kick off the project in Claude Code:

---

**Prompt for Claude Code:**

```
I want to build "Patel Power" - a mobile-first PWA for my family to track workouts together in 2026.

Tech stack:
- Next.js 14+ (App Router) with TypeScript
- Tailwind CSS for styling
- Supabase for auth (magic links) and database
- Framer Motion for animations
- Deploy to Vercel

I have the Supabase MCP server connected. My Supabase project is already created.

Core features:
1. Magic link authentication (passwordless - easy for non-tech-savvy family)
2. User profiles with display name and emoji avatar
3. First-time user onboarding (4-step tutorial: welcome, how to log, streaks explained, leaderboard/badges intro)
4. "Log Workout" button - one workout per day, can post-date up to 7 days
5. Family leaderboard with real-time updates (this week/month/all time)
6. Streak tracking with animated flame visual
7. Badges/achievements for milestones
8. Activity feed showing family members' recent workouts
9. Confetti celebration when logging a workout
10. PWA configuration for install on phones

Design guidelines:
- Warm, energetic color palette (orange/coral primary, teal secondary)
- Large touch targets, mobile-first
- Fun and celebratory - make logging workouts feel rewarding
- Clean, readable typography (use Inter or similar)
- Smooth animations throughout

Please start by:
1. Setting up the Supabase database schema (profiles, workouts, user_badges tables with RLS)
2. Creating the Next.js project with all dependencies
3. Building out the full application

Make it visually polished and fun - this is for my family and I want them to enjoy using it!
```

---

Happy building, and here's to Patel Power crushing their fitness goals in 2026! 💪🔥
