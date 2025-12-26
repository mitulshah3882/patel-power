# Spec: 24 Workout Race Badges & Family Profile Modal

**Branch:** `feature/race-badges-profile-modal`
**Created:** December 26, 2025

---

## Overview

Two features for the Patel family 2026 fitness challenge:

1. **24 Workout Race** - Competitive badges for reaching 24 workouts
2. **Family Profile Modal** - View any family member's workout history

---

## Feature 1: 24 Workout Race Badges

### Motivation

The family wants a shared goal for 2026: everyone completes 24 workouts. The first person to reach 24 gets a special "Winner" badge, while everyone else who finishes earns a "Finisher" badge.

### Badge Definitions

| Badge | ID | Emoji | Description | Requirement |
|-------|-----|-------|-------------|-------------|
| Race Winner | `race_winner` | 🏆 | First in the family to log 24 workouts! | First to 24 workouts |
| Race Finisher | `race_finisher` | 🎖️ | Completed the 24 workout challenge! | Log 24 total workouts |

### Rules

1. Only **one person** can earn the Race Winner badge
2. Once someone earns Race Winner, all subsequent users who reach 24 earn Race Finisher
3. A user cannot earn both badges - it's one or the other
4. The 24 workouts are cumulative (all-time total, not a streak)

### Race Condition Handling

If two users log their 24th workout simultaneously:
- Database unique constraint ensures only one `race_winner` badge exists
- Code handles constraint violation by awarding `race_finisher` instead

### Database Change

```sql
CREATE UNIQUE INDEX unique_race_winner_badge
ON user_badges (badge_type)
WHERE badge_type = 'race_winner';
```

---

## Feature 2: Family Profile Modal

### Motivation

Family members want to see what workouts others have been doing - dates, notes, and badges earned. This builds accountability and lets members cheer each other on.

### User Flow

1. User goes to Leaderboard page
2. Taps on any family member's card
3. Slide-up modal appears with that person's profile
4. User can scroll through workout history
5. Tap backdrop or swipe down to close

### Modal Contents

**Header**
- Avatar emoji (large)
- Display name
- "Member since [month year]"

**Stats Grid** (4 columns)
- Total workouts
- Current streak (with flame)
- Longest streak
- Badge count

**Badges Section**
- Grid of earned badges (no locked badges shown)
- Empty state: "No badges earned yet"

**Workout History**
- List sorted newest first
- Each entry shows:
  - Date (e.g., "Fri, Dec 20")
  - Note (if any)
  - Relative time logged (e.g., "2 days ago")
- Empty state: "No workouts logged yet"

### UI/UX

- **Animation**: Slide up from bottom using Framer Motion
- **Max height**: 85% of viewport
- **Close**: Tap backdrop or drag handle
- **Scrollable**: Content scrolls within modal
- **Mobile-first**: Full width on mobile, max-width on desktop

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/badges.ts` | Add 2 badge definitions, update `checkNewBadges` signature and logic |
| `src/app/page.tsx` | Fetch all family badges in `handleWorkoutLogged` |
| `src/components/LeaderboardCard.tsx` | Add `onClick` prop |
| `src/app/leaderboard/page.tsx` | Add modal state, fetch badges, render ProfileModal |
| `src/components/ProfileModal.tsx` | **NEW** - Slide-up modal component |

---

## Testing Checklist

### Race Badges
- [ ] User with < 24 workouts earns neither badge
- [ ] First user to 24 workouts earns `race_winner`
- [ ] Second user to 24 workouts earns `race_finisher`
- [ ] User who already has winner doesn't get finisher
- [ ] Badge celebration modal shows correctly

### Profile Modal
- [ ] Clicking LeaderboardCard opens modal
- [ ] Modal shows correct user's data
- [ ] Stats display correctly
- [ ] Earned badges display (not locked ones)
- [ ] Workouts sorted newest first
- [ ] Notes visible on workouts
- [ ] Empty states display when no data
- [ ] Modal closes on backdrop tap
- [ ] Scroll works within modal
- [ ] Animation smooth on open/close
