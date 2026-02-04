# Bug Analysis and Fix Plan

## Bug 1: Data Not Saved Properly (Race Condition)

**Location:** `src/hooks/useTasks.ts` - `addTask` function

**Root Cause:**

```typescript
const addTask = async (taskData: Partial<Task> & { title: string }) => {
  const newTask: Task = { ... };
  taskService.saveTask(newTask);  // Missing await!
  setTasks((prev) => [...prev, newTask]);
};
```

`taskService.saveTask(newTask)` is called without `await`, so the function returns immediately while the async write operation may still be in progress. If the user reloads the page before IndexedDB completes the write, the data is lost.

**Fix:**
Add `await` before `taskService.saveTask(newTask)`.

---

## Bug 2: Drag-Drop Order Not Persisted

**Location:** `src/hooks/useTasks.ts` - `reorderTasks` function

**Root Cause:**

```typescript
const reorderTasks = async (activeId: string, overId: string) => {
  setTasks((prev) => {
    const newTasks = arrayMove(prev, oldIndex, newIndex);
    return newTasks.map((t, i) => ({ ...t, order: i }));
  });
  // Missing: taskService.updateTask calls to persist new order!
};
```

The function only updates local state (`setTasks`) but never persists the new `order` values to IndexedDB. When the page reloads, the original order is restored from database.

**Fix:**
After updating local state, loop through all tasks and call `taskService.updateTask` for each task with its new `order` value.

---

## Bug 3: Stale State in Task Detail Dialog

**Location:** `src/features/dashboard/components/TaskDetailDialog.tsx`

**Root Cause:**

```typescript
export function TaskDetailDialog() {
  const [selectedTask] = useAtom(selectedTaskAtom);
  // ...
  const [title, setTitle] = useState(selectedTask?.title || ''); // Only initializes once
  const [description, setDescription] = useState(selectedTask?.description || '');
  // ... other useState hooks with initial values from selectedTask
}
```

`useState` only uses the initial value on the first render. When `selectedTask` changes (user switches from Task A to Task B), the form fields retain the old values because `useState` does not re-initialize.

**Fix:**
Use `useEffect` to sync form state with `selectedTask` whenever it changes:

```typescript
useEffect(() => {
  if (selectedTask) {
    setTitle(selectedTask.title || '');
    setDescription(selectedTask.description || '');
    // ... sync other fields
  }
}, [selectedTask]);
```

---

## Summary of Fixes

| Bug | File                 | Issue                   | Solution                                        |
| --- | -------------------- | ----------------------- | ----------------------------------------------- |
| 1   | useTasks.ts          | Missing `await` on save | Add `await` to `taskService.saveTask`           |
| 2   | useTasks.ts          | Order not persisted     | Add DB update calls after reorder               |
| 3   | TaskDetailDialog.tsx | Stale form state        | Add `useEffect` to sync state with selectedTask |
