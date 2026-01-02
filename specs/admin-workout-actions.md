# Spec: Admin Workout Actions

**Created:** January 2, 2026

---

## Overview

Add admin capabilities to edit and delete any family member's workouts directly from the ProfileModal. Only users with `is_admin = true` in their profile will see these actions.

---

## Database Changes (Already Applied)

The following changes were applied via migration `add_admin_capabilities`:

```sql
-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;

-- Set Mitul as admin
UPDATE profiles SET is_admin = true WHERE id = '0a4be209-56df-4911-8884-9ea30b3f909d';

-- RLS policy: admins can delete any workout
CREATE POLICY "Users can delete own workouts or admin can delete any"
ON workouts FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- RLS policy: admins can update any workout
CREATE POLICY "Users can update own workouts or admin can update any"
ON workouts FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
```

---

## UI Implementation

### User Flow

1. Admin opens Leaderboard page
2. Taps on any family member's card
3. ProfileModal slides up showing workout history
4. Each workout shows edit (pencil) and delete (trash) icons
5. **Edit**: Opens centered modal with date picker and note input
6. **Delete**: Opens confirmation modal

Non-admin users see the same ProfileModal but without edit/delete buttons.

### Edit Modal

- Centered modal (follows LogWorkoutButton pattern)
- Pre-filled with existing workout data
- Fields:
  - Date picker (no constraints for admin)
  - Note input (optional)
- Error handling for duplicate date constraint
- Save/Cancel buttons

### Delete Confirmation Modal

- Centered confirmation dialog
- Shows workout date and owner name
- Delete/Cancel buttons
- Red delete button for destructive action

### Visual Design

**Edit/Delete Buttons (per workout item)**
- Small icon buttons (pencil, trash)
- Gray by default, colored on hover
- Positioned to the right of relative timestamp

**Button States**
- Hover: Primary color for edit, red for delete
- Loading: Disabled with "Saving..."/"Deleting..." text
- Error: Red error message below form

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/types/database.ts` | Add `is_admin` to Profile type |
| `src/app/leaderboard/page.tsx` | Fetch current user's admin status, pass to ProfileModal with refresh callback |
| `src/components/ProfileModal.tsx` | Add props (`isAdmin`, `onWorkoutUpdated`), edit/delete buttons, modals, handlers |

---

## Implementation Details

### Step 1: Update TypeScript Types

**File:** `src/lib/types/database.ts`

Add `is_admin: boolean` to profiles Row, Insert, and Update types.

### Step 2: Leaderboard Page Updates

**File:** `src/app/leaderboard/page.tsx`

1. Add state: `isCurrentUserAdmin`
2. Fetch current user's profile with `is_admin` field
3. Pass to ProfileModal:
   - `isAdmin={isCurrentUserAdmin}`
   - `onWorkoutUpdated={fetchLeaderboard}`

### Step 3: ProfileModal Updates

**File:** `src/components/ProfileModal.tsx`

1. Update props interface with `isAdmin?: boolean` and `onWorkoutUpdated?: () => void`
2. Add state for edit/delete modals
3. Add inline SVG icons (PencilIcon, TrashIcon)
4. Add edit/delete buttons to workout list items (conditional on `isAdmin`)
5. Add Edit Modal with Framer Motion animations
6. Add Delete Confirmation Modal
7. Add handler functions:
   - `handleEditClick(workout)` - opens edit modal with pre-filled data
   - `handleSaveEdit()` - updates workout via Supabase
   - `handleDelete()` - deletes workout via Supabase
8. Handle unique constraint error (code `23505`) for duplicate dates

---

## Error Handling

| Error | User Message |
|-------|--------------|
| Duplicate date | "A workout already exists for this date!" |
| Network/other | Display actual error message |

---

## Testing Checklist

### Access Control
- [ ] Non-admin users see no edit/delete buttons
- [ ] Admin users see edit/delete buttons on all workouts
- [ ] Admin can edit/delete their own workouts
- [ ] Admin can edit/delete other users' workouts

### Edit Functionality
- [ ] Edit modal opens with correct data pre-filled
- [ ] Date can be changed
- [ ] Note can be changed or cleared
- [ ] Save updates the workout successfully
- [ ] Error shows for duplicate date
- [ ] Cancel closes modal without saving

### Delete Functionality
- [ ] Delete confirmation shows correct workout info
- [ ] Delete removes workout successfully
- [ ] Cancel closes modal without deleting

### Data Refresh
- [ ] Leaderboard refreshes after edit
- [ ] Leaderboard refreshes after delete
- [ ] Other clients see updates via real-time subscriptions

### UI/UX
- [ ] Dark mode styling works correctly
- [ ] Mobile touch targets are large enough
- [ ] Modals animate smoothly
- [ ] Loading states display during operations
