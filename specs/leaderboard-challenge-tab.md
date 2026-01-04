# Spec: Leaderboard Challenge Tab & This Year Filter

**Created:** January 4, 2026

---

## Overview

Update the leaderboard page with two changes:

1. **Replace "All Time" with "This Year"** - Filter workouts to 2026 only
2. **Replace "This Month" with "Challenge"** - Show race progress to 24 workouts

**Final tabs:** This Week | This Year | Challenge

---

## Feature 1: This Year Tab

### Motivation

"All Time" included 2025 test data. "This Year" focuses on the 2026 challenge.

### Implementation

Add `getWorkoutsThisYear()` helper that filters workouts to the current calendar year (2026).

---

## Feature 2: Challenge Tab

### Motivation

The family's 2026 goal is for everyone to complete 24 workouts. The Challenge tab provides a dedicated view showing everyone's progress toward this goal.

### UI Design

```
┌─────────────────────────────────┐
│ 🏁 Race to 24 Workouts          │
│ First to complete 24 wins!      │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🏆  👩  Sarah (Winner!)         │
│     24 / 24 workouts      100%  │
│ [████████████████████████████] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🎖️  👨  Mike                    │
│     24 / 24 workouts      100%  │
│ [████████████████████████████] │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ #3  👧  Priya (You)             │
│     18 / 24 workouts       75%  │
│ [█████████████████░░░░░░░░░░░] │
└─────────────────────────────────┘
```

### Card States

| State | Icon | Styling |
|-------|------|---------|
| Winner | 🏆 | Gold/amber gradient, border, "Winner!" label |
| Finisher | 🎖️ | Green completed progress bar |
| In Progress | #N | Standard card, orange progress bar |
| Current User | - | Highlighted border, "(You)" label |

### Sorting

1. Winner first (has `race_winner` badge)
2. Then by workout count descending
3. Finishers grouped together after winner

### Progress Bar

- Animated fill using Framer Motion
- Shows X / 24 workouts
- Percentage displayed on right
- Colors:
  - Winner: amber/gold gradient
  - Completed: green gradient
  - In progress: primary orange gradient

### Click Behavior

Clicking a challenge card opens the existing ProfileModal (same as regular leaderboard).

---

## Related Badges (already exist)

| Badge | ID | Emoji | Description |
|-------|-----|-------|-------------|
| Race Winner | `race_winner` | 🏆 | First in the family to log 24 workouts |
| Race Finisher | `race_finisher` | 🎖️ | Completed the 24 workout challenge |

No badge changes required - logic already implemented.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/utils.ts` | Add `getWorkoutsThisYear()` helper function |
| `src/components/ChallengeCard.tsx` | **NEW** - Progress bar card component with dark mode support |
| `src/app/leaderboard/page.tsx` | Update tabs, add challenge view state and rendering, add dark mode |
| `src/components/LeaderboardCard.tsx` | Add dark mode support |
| `src/components/ActivityFeed.tsx` | Add dark mode support |

---

## Testing Checklist

### This Year Tab
- [ ] Only shows workouts from 2026
- [ ] Correctly counts workouts for each user
- [ ] Sorting by workout count works

### Challenge Tab
- [ ] Shows all family members
- [ ] Progress bar fills correctly (X/24)
- [ ] Percentage calculation correct
- [ ] Winner shown at top with 🏆 and gold styling
- [ ] Finisher shown with 🎖️ and green bar
- [ ] Current user highlighted
- [ ] Clicking card opens ProfileModal
- [ ] Dark mode styling works
- [ ] Progress bar animation smooth

### Tab Navigation
- [ ] All three tabs work
- [ ] State persists correctly when switching
- [ ] Real-time updates reflect in all tabs
