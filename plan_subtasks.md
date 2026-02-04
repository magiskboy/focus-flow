# Implementation Plan: Subtasks (Checklist) Feature

## 1. Phân tích hiện trạng (Current State Analysis)

### ✅ What's Already Available

- **Type Definitions**: The `Subtask` interface and `subtasks?: Subtask[]` field in `Task` interface are already defined in `src/types/task.ts`
  ```typescript
  export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
  }
  ```
- **State Management**: Jotai atoms (`tasksAtom`, `selectedTaskAtom`) are set up and will automatically persist subtasks since they're part of the Task data structure
- **Data Persistence**: IndexedDB storage (`taskService`) supports partial updates via `updateTask()`, so subtasks can be saved without rewriting the entire task
- **UI Components**: `TaskDetailDialog.tsx` has a well-structured form with spacing and styling that we can extend
- **Icon Library**: Lucide React is already available (CheckCircle, Circle, Trash2, Plus, etc.)

### 📊 TaskCard Current State

- Currently displays: title, description, status icon, due date, pomodoro count, tags
- **Missing**: Subtask progress indicator

### 📝 TaskDetailDialog Current State

- Has sections for: Title, Status, Estimation, Tags, Description
- **Missing**: Subtasks/Checklist section

---

## 2. Chi tiết thay đổi (Proposed Changes)

### 2.1 Files to Modify

#### A. `src/features/dashboard/components/TaskDetailDialog.tsx`

**Purpose**: Add UI for managing subtasks checklist

**New State to Add**:

```typescript
const [subtasks, setSubtasks] = useState<Subtask[]>(selectedTask?.subtasks || []);
const [newSubtaskInput, setNewSubtaskInput] = useState('');
```

**CRUD Logic to Implement**:

1. **Add Subtask**:
   - Trigger: User types in input field + hits Enter or clicks "+" button
   - Validation: Ignore empty or whitespace-only input
   - Create new subtask object: `{ id: crypto.randomUUID(), title: trimmedInput, completed: false }`
   - Update local state: `setSubtasks([...subtasks, newSubtask])`
   - Persist: Include `subtasks` in `updateTask()` call on form submit OR persist immediately on add (need to decide - suggest immediate persist for better UX)

2. **Toggle Subtask Status**:
   - Trigger: User clicks checkbox/circle on a subtask
   - Action: `subtasks.map(st => st.id === subtaskId ? {...st, completed: !st.completed} : st)`
   - Persist: Update task immediately via `updateTask(selectedTask.id, { subtasks })`

3. **Delete Subtask**:
   - Trigger: User clicks trash icon on a subtask
   - Action: `subtasks.filter(st => st.id !== subtaskId)`
   - Persist: Update task immediately via `updateTask(selectedTask.id, { subtasks })`

4. **Progress Calculation**:
   ```typescript
   const completedCount = subtasks.filter((st) => st.completed).length;
   const progressPercent =
     subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;
   ```

**UI Placement**:

- Insert a new section between "Metadata Row" (Status/Estimation/Tags) and "Description" section
- This keeps metadata grouped and allows subtasks to be seen before reading notes
- The section should include:
  - Header with icon (CheckCircle2)
  - Progress bar or "X of Y" indicator when subtasks exist
  - Input field + add button
  - Scrollable list of subtasks (max height ~300px to prevent dialog overflow)

#### B. `src/features/dashboard/components/TaskCard.tsx`

**Purpose**: Display subtask progress indicator on the card

**New Display Element**:

- Add subtask progress indicator in the metadata row (bottom of card)
- Show only if `task.subtasks && task.subtasks.length > 0`
- Display format: "2/5" subtasks completed OR small progress bar
- Icon: CheckCircle2 or ListChecks from Lucide

**Implementation**:

```typescript
{task.subtasks && task.subtasks.length > 0 && (
  <div className='flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400'>
    <CheckCircle2 className='w-3 h-3' />
    <span>
      {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
    </span>
  </div>
)}
```

---

## 3. Các trường hợp biên (Edge Cases)

### 3.1 Data Issues

| Case                                     | Handling                                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Task has no `subtasks` field (undefined) | Initialize as empty array `[]` when reading                        |
| Empty subtasks array `[]`                | Don't show subtask section in TaskCard, show empty state in Dialog |
| Task has `subtasks` but array is `null`  | Treat as empty array, prevent null reference errors                |

### 3.2 User Input Issues

| Case                            | Handling                                                  |
| ------------------------------- | --------------------------------------------------------- |
| Empty subtask input (Enter key) | Ignore, clear input, do nothing                           |
| Whitespace-only input           | Trim before validation, if empty after trim -> ignore     |
| Duplicate subtask titles        | Allow duplicates (user might want multiple similar items) |
| Very long subtask title         | Allow it, use `truncate` or `line-clamp` for display      |
| Special characters in input     | Allow, but sanitize HTML (React handles this by default)  |

### 3.3 UI/UX Edge Cases

| Case                        | Handling                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| More than ~10 subtasks      | Set max-height on list container + overflow-y-auto for scrolling      |
| All subtasks completed      | Consider auto-marking parent task as completed (optional enhancement) |
| Last subtask deleted        | Show empty state message "No subtasks yet"                            |
| Rapid add/delete operations | Debounce or ensure state updates are batched properly                 |

### 3.4 Synchronization Issues

| Case                                                | Handling                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| User closes dialog without saving                   | Since we persist subtasks immediately, this is expected behavior |
| User updates task while another edit is in progress | Use function updater in setTasks to ensure latest state          |
| Concurrent edits (if we add this feature)           | Last write wins (acceptable for single-user offline app)         |

---

## 4. Các bước thực hiện (Step-by-Step Implementation)

### Phase 1: Setup & State Management (Step 1-2)

**Step 1: Add Local State to TaskDetailDialog**

- Add `subtasks` state initialized from `selectedTask.subtasks || []`
- Add `newSubtaskInput` state for managing the add input field
- Add progress calculation helper function

**Outcome**: Dialog has local state for managing subtasks CRUD

---

### Phase 2: UI Components in TaskDetailDialog (Step 3-5)

**Step 2: Create Subtasks Section UI**

- Add new section with header, progress indicator, and space for subtask list
- Position between metadata row and description textarea
- Empty state: "No subtasks yet" message when array is empty

**Step 3: Implement Add Subtask UI**

- Input field with placeholder text (e.g., "Add a subtask...")
- Add button (+ icon) next to input
- Support Enter key to trigger add
- Style to match existing form inputs (Tailwind classes)

**Step 4: Implement Subtask List UI**

- Map through `subtasks` array to render items
- Each item: checkbox indicator + title + delete button
- Checkbox: Use Circle vs CheckCircle2 based on `completed` status
- Delete button: Trash2 icon, hover effect (red)
- Style: Compact, consistent with card design

**Step 5: Add Progress Indicator**

- Show progress bar OR "X of Y" text when subtasks exist
- visually indicate completion (e.g.,green progress bar)
- Hide if no subtasks

**Outcome**: Full UI for viewing, adding, and managing subtasks is complete

---

### Phase 3: Event Handlers & Logic (Step 6-8)

**Step 6: Implement Add Subtask Handler**

- Validate input (not empty/whitespace only)
- Create new subtask object with `crypto.randomUUID()`
- Update local state
- Persist immediately via `updateTask(selectedTask.id, { subtasks: updated })`
- Clear input field after add
- Focus back on input for rapid entry

**Step 7: Implement Toggle Subtask Handler**

- Create function that toggles `completed` status by ID
- Update local state
- Persist immediately via `updateTask()`
- Update progress display

**Step 8: Implement Delete Subtask Handler**

- Create function that removes subtask by ID
- Update local state
- Persist immediately via `updateTask()`

**Outcome**: All CRUD operations work correctly and persist to IndexedDB

---

### Phase 4: TaskCard Integration (Step 9)

**Step 9: Add Subtask Progress to TaskCard**

- Calculate completed count for each task
- Add indicator in metadata row (next to pomodoro, due date, etc.)
- Use CheckCircle2 icon + "X/Y" text format
- Only show if subtasks exist (length > 0)
- Consider adding subtle visual cue (e.g., green when 100% complete)

**Outcome**: Users can see subtask progress at a glance from the board view

---

### Phase 5: Testing & Polish (Step 10-11)

**Step 10: Form Submission Handling**

- Ensure `handleSubmit` in TaskDetailDialog includes subtasks in updates
- Test that subtasks are saved when clicking "Save Changes"
- Test that changes persist after closing and reopening dialog

**Step 11: Edge Case Testing**

- Test adding/deleting subtasks rapidly
- Test with very long subtask titles
- Test with 0, 1, 10+ subtasks
- Test light/dark mode appearance
- Test that progress updates correctly after each action

**Outcome**: Feature is complete and all edge cases are handled

---

## 5. Optional Enhancements (Future Considerations)

1. **Auto-complete parent task**: When all subtasks are done, auto-mark task as completed
2. **Keyboard navigation**: Arrow keys to navigate subtasks, Space to toggle, Delete to remove
3. **Drag & drop reordering**: Allow reordering subtasks within the list
4. **Subtask details**: Expand subtasks to have their own description field
5. **Assignee/ownership**: If multi-user support is added later, assign subtasks to different users
6. **Due dates per subtask**: Add `dueDate` field to Subtask interface
7. **Subtask templates**: Create reusable subtask lists for common tasks

---

## 6. Summary

This implementation plan leverages the existing Task interface and data structures without requiring any type changes. The feature can be built incrementally, with state management and persistence already handled by the existing infrastructure. The UI will consist of:

1. A new "Checklist" section in TaskDetailDialog for CRUD operations
2. A progress indicator in TaskCard for quick status overview

All changes are additive and don't require refactoring existing code.
