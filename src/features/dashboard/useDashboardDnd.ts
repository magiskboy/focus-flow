import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types/task';
import { useState, useCallback } from 'react';

export function useDashboardDnd(
  tasks: Task[],
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>,
  reorderTasks: (activeId: string, overId: string) => Promise<void>,
) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const task = tasks.find((t) => t.id === active.id);
      if (task) setActiveTask(task);
    },
    [tasks],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveTask(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // 1. Check if moving to a different column (droppable)
      if (['todo', 'in-progress', 'completed'].includes(overId)) {
        const activeTaskData = active.data.current?.task as Task;
        if (activeTaskData && activeTaskData.status !== overId) {
          updateTaskStatus(activeId, overId as TaskStatus);
        }
      }
      // 2. Check if re-ordering within same column or moving next to another task
      else if (activeId !== overId) {
        const overTaskData = over.data.current?.task as Task;
        const activeTaskData = active.data.current?.task as Task;

        if (activeTaskData && overTaskData) {
          if (activeTaskData.status !== overTaskData.status) {
            updateTaskStatus(activeId, overTaskData.status);
          }
        }
        reorderTasks(activeId, overId);
      }

      setActiveTask(null);
    },
    [updateTaskStatus, reorderTasks],
  );

  return { activeTask, handleDragStart, handleDragEnd };
}
