import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useTasks } from '@/hooks/useTasks';
import { DashboardToolbar } from './components/DashboardToolbar';
import { TaskColumn } from './components/TaskColumn';
import { TaskCard } from './components/TaskCard';
import { CreateTaskDialog } from './components/CreateTaskDialog';
import { TaskDetailDialog } from './components/TaskDetailDialog';
import type { Task, TaskStatus } from '@/types/task';
import { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskIdAtom } from '@/store/atoms';

export function Dashboard() {
  const { tasks, updateTaskStatus, reorderTasks } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTaskId] = useAtom(selectedTaskIdAtom);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [tasks, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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
        // If different status, update status first
        if (activeTaskData.status !== overTaskData.status) {
          updateTaskStatus(activeId, overTaskData.status);
        }
      }
      reorderTasks(activeId, overId);
    }

    setActiveTask(null);
  };

  const tasksByStatus = useMemo(() => {
    return {
      todo: filteredTasks
        .filter((t) => t.status === 'todo')
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
      'in-progress': filteredTasks
        .filter((t) => t.status === 'in-progress')
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
      completed: filteredTasks
        .filter((t) => t.status === 'completed')
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    };
  }, [filteredTasks]);

  return (
    <div className='flex flex-col h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300'>
      <DashboardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTaskClick={() => setIsCreateModalOpen(true)}
      />

      {/* Create Task Dialog */}
      <CreateTaskDialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      {/* Task Detail Dialog */}
      <TaskDetailDialog key={selectedTaskId || 'none'} />

      {/* Main Content */}
      <main className='flex-1 overflow-x-auto p-8'>
        <div className='max-w-7xl mx-auto flex justify-center gap-8 h-full pb-4'>
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <TaskColumn id='todo' title='To Do' tasks={tasksByStatus.todo} />
            <TaskColumn id='in-progress' title='In Progress' tasks={tasksByStatus['in-progress']} />
            <TaskColumn id='completed' title='Completed' tasks={tasksByStatus.completed} />

            <DragOverlay dropAnimation={null}>
              {activeTask ? (
                <div className='w-[326px] pointer-events-none select-none'>
                  <TaskCard task={activeTask} isStatic={true} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  );
}
