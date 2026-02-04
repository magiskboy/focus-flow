# Implementation Plan: Subtasks (Checklist) Feature

## 1. Phân tích hiện trạng (Current State Analysis)

### 1.1 Dữ liệu đã có sẵn

- **`src/types/task.ts`**: Interface `Subtask` và `Task` đã được định nghĩa hoàn chỉnh
  - `Subtask`: `{ id, title, completed }`
  - `Task` có property `subtasks?: Subtask[]`

### 1.2 State Management

- **`src/store/atoms.ts`**: `tasksAtom` lưu trữ danh sách task, `selectedTaskAtom` lấy task được chọn
- **`src/hooks/useTasks.ts`**: Có sẵn `updateTask()` function hỗ trợ partial updates
- Task data được sync với IndexedDB qua `taskService`

### 1.3 UI Components hiện tại

- **`TaskDetailDialog.tsx`**: Dialog edit task, có các section: Title, Status, Estimate (Pomodoros), Tags, Notes
- **`TaskCard.tsx`**: Card hiển thị thông tin task, có chỗ cho: title, description, status icon, due date, pomodoros, tags

### 1.4 Lucide Icons có sẵn

- `CheckCircle2`, `Circle`, `Trash2`, `Plus` (cần kiểm tra xem có `Check` hay `Square` icon không)

---

## 2. Chi tiết thay đổi (Proposed Changes)

### 2.1 File cần sửa đổi

| File                                                     | Thay đổi                                                |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `src/features/dashboard/components/TaskCard.tsx`         | Thêm progress indicator (subtasks count)                |
| `src/features/dashboard/components/TaskDetailDialog.tsx` | Thêm Checklist section với CRUD operations              |
| `src/hooks/useTasks.ts`                                  | **Không cần thay đổi** (updateTask đã support subtasks) |

### 2.2 State mới cần thêm vào `TaskDetailDialog.tsx`

```typescript
// Local state cho subtasks (trước khi save)
const [subtasks, setSubtasks] = useState<Subtask[]>(selectedTask?.subtasks || []);

// Input state cho việc thêm subtask mới
const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
```

### 2.3 Logic CRUD cho Subtasks

#### Thêm Subtask:

```typescript
const handleAddSubtask = (e: React.KeyboardEvent | React.FormEvent) => {
  e.preventDefault();
  const trimmed = newSubtaskTitle.trim();
  if (!trimmed) return;

  const newSubtask: Subtask = {
    id: crypto.randomUUID(),
    title: trimmed,
    completed: false,
  };

  setSubtasks([...subtasks, newSubtask]);
  setNewSubtaskTitle('');
};
```

#### Toggle Subtask:

```typescript
const handleToggleSubtask = (subtaskId: string) => {
  setSubtasks(
    subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
  );
};
```

#### Xóa Subtask:

```typescript
const handleDeleteSubtask = (subtaskId: string) => {
  // Option 1: Direct delete (không confirm)
  setSubtasks(subtasks.filter((st) => st.id !== subtaskId));

  // Option 2: Với confirm (nếu muốn)
  if (window.confirm('Delete this subtask?')) {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  }
};
```

#### Cập nhật vào Task (trong handleSubmit):

```typescript
await updateTask(selectedTask.id, {
  // ... các fields khác
  subtasks: subtasks.length > 0 ? subtasks : undefined, // Nếu empty thì xóa field
});
```

### 2.4 Sync với Jotai/Storage

**Quan trọng**: Khi user toggle subtask trong dialog nhưng chưa bấm "Save Changes", có 2 approach:

**Approach A (Immediate Sync)**: Subtask changes được save ngay lập tức

- Pro: UI phản hồi nhanh, không cần nút save riêng
- Con: Nhiều write operations hơn

**Approach B (Pending Changes)**: Subtask changes chỉ được save khi bấm "Save"

- Pro: Giảm writes, nhất quán với behavior hiện tại của dialog
- Con: Cần quản lý local state riêng

**Đề xuất**: Approach B (giữ nguyên behavior hiện tại, subtasks được lưu trong local state và chỉ sync khi submit)

---

## 3. Các trường hợp biên (Edge Cases)

### 3.1 Task chưa có mảng subtasks (undefined)

```typescript
// Trong TaskDetailDialog.tsx
const [subtasks, setSubtasks] = useState<Subtask[]>(selectedTask?.subtasks || []);
// Handle: Default thành empty array []
```

### 3.2 Nhập text rỗng hoặc chỉ whitespace

```typescript
const handleAddSubtask = (e: React.FormEvent) => {
  e.preventDefault();
  const trimmed = newSubtaskTitle.trim();
  if (!trimmed) return; // Không làm gì nếu empty
  // ...
};
```

### 3.3 Tất cả subtasks hoàn thành

- Tự động update task status thành `completed`? (Optional feature)
- Hiển thị celebration animation? (Optional)
- **Decision**: Để trống cho Phase 2, chỉ hiển thị progress bar đầy

### 3.4 Xóa task cha (parent task)

- `taskService.deleteTask` đã tự động xóa tất cả subtasks vì chúng nằm trong document/task

### 3.5 Empty state

- Khi không có subtask nào, hiển thị placeholder text "No subtasks yet"

### 3.6 Performance với nhiều subtasks

- Subtasks array có thể grow large, cần pagination hoặc virtualization?
- **Decision**: Để đơn giản, limit UI hiển thị max 50 subtasks visible

---

## 4. Giao diện (UI/UX Design)

### 4.1 TaskCard.tsx - Progress Badge

```
Vị trí: Bên cạnh pomodoro count hoặc thay thế
Style: Badge nhỏ với icon checklist + fraction (2/5)

Ví dụ:
┌─────────────────────────────────────────────────┐
│ [Task Title]                              [○]  │
│ Description...                                 │
│                                                 │
│ [📅 Due] [🍅 0/2] [✓ 2/5]           [#tag]      │
└─────────────────────────────────────────────────┘
```

**Tailwind Classes:**

```tsx
{
  task.subtasks && task.subtasks.length > 0 && (
    <div className='flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400'>
      <CheckSquare className='w-3 h-3' />
      {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
    </div>
  );
}
```

### 4.2 TaskDetailDialog.tsx - Checklist Section

**Vị trí đề xuất**: Giữa "Notes" section và "Footer Actions"

```
┌─────────────────────────────────────────────────┐
│ [□] Add a subtask...                           │
│                                                 │
│ [✓] Subtask 1                            [🗑]   │
│ [✓] Subtask 2                            [🗑]   │
│ [□] Subtask 3                            [🗑]   │
│                                                 │
│ Progress: ████████░░░░░░░ 60% (3/5)             │
└─────────────────────────────────────────────────┘
```

**Component Structure:**

```tsx
{
  /* Progress Bar */
}
<div className='space-y-2'>
  <div className='flex items-center justify-between text-xs'>
    <span className='font-medium text-slate-500'>Progress</span>
    <span className='font-bold text-slate-700 dark:text-slate-300'>
      {completedCount}/{totalCount} ({percentage}%)
    </span>
  </div>
  <div className='h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden'>
    <div
      className='h-full bg-blue-500 transition-all duration-300'
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>;

{
  /* Subtasks List */
}
<div className='space-y-2 max-h-60 overflow-y-auto'>
  {subtasks.map((subtask) => (
    <SubtaskItem
      key={subtask.id}
      subtask={subtask}
      onToggle={() => handleToggleSubtask(subtask.id)}
      onDelete={() => handleDeleteSubtask(subtask.id)}
    />
  ))}
</div>;

{
  /* Add Input */
}
<form onSubmit={handleAddSubtask} className='relative'>
  <input
    type='text'
    value={newSubtaskTitle}
    onChange={(e) => setNewSubtaskTitle(e.target.value)}
    placeholder='+ Add a subtask...'
    className='w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm'
  />
  <Plus className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
</form>;
```

### 4.3 Icons to use (Lucide React)

- `CheckSquare` - completed subtask
- `Square` - incomplete subtask
- `Trash2` - delete
- `Plus` - add
- `Check` - maybe for inline complete

---

## 5. Các bước thực hiện (Step-by-step)

### Step 1: Thêm Subtask Progress Badge vào TaskCard

**File:** `src/features/dashboard/components/TaskCard.tsx`

- Thêm import `CheckSquare` từ lucide-react
- Thêm logic tính completed count
- Hiển thị badge bên cạnh pomodoro estimation
- Test: Tạo task có subtasks, verify badge hiển thị đúng

### Step 2: Thêm Checklist Section vào TaskDetailDialog

**File:** `src/features/dashboard/components/TaskDetailDialog.tsx`

- Thêm imports: `CheckSquare`, `Square`, `Trash2`, `Plus`
- Thêm local state: `subtasks`, `newSubtaskTitle`
- Thêm handlers: `handleAddSubtask`, `handleToggleSubtask`, `handleDeleteSubtask`
- Thêm Progress Bar component
- Thêm Subtasks List UI
- Thêm Add Subtask Input
- Update `handleSubmit` để include subtasks

### Step 3: Update handleSubmit to save subtasks

**Trong handleSubmit:**

```typescript
await updateTask(selectedTask.id, {
  title: title.trim(),
  description: description.trim() || undefined,
  estimatedPomodoros,
  tags: tags.length > 0 ? tags : undefined,
  status,
  subtasks: subtasks.length > 0 ? subtasks : undefined,
});
```

### Step 4: Cleanup & Edge Cases

- Test xóa task (subtasks tự xóa theo)
- Test empty subtasks array
- Test toggle subtask -> save -> reload page -> verify persistence
- Test dark mode
- Run `yarn build` để verify type safety
- Run `yarn lint` để fix any linting issues

---

## 6. Files không cần thay đổi

- `src/types/task.ts` - Type definitions đã sẵn sàng
- `src/hooks/useTasks.ts` - updateTask() đã support subtasks
- `src/store/atoms.ts` - Không cần thêm atom mới
- `src/services/taskService.ts` - IndexedDB operations đã transparent

---

## 7. Review Points

Before proceeding to implementation, please review:

1. ✅ Vị trí Checklist section trong Dialog có hợp lý không?
2. ✅ Progress bar nên ở trên list hay dưới list?
3. ✅ Delete subtask có cần confirm không?
4. ✅ Subtasks có nên auto-save hay chỉ khi bấm Save?

---

**Plan prepared by:** Senior Frontend Engineer  
**Date:** Generated for FocusFlow  
**Version:** 1.0
