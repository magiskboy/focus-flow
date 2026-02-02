import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { cn } from '@/utils/cn';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export function TaskColumn({ id, title, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const statusColors = {
    todo: 'bg-slate-50/50 dark:bg-slate-900/50',
    'in-progress': 'bg-blue-50/30 dark:bg-blue-900/10',
    completed: 'bg-emerald-50/30 dark:bg-emerald-900/10',
  };

  const borderColors = {
    todo: 'border-slate-200 dark:border-slate-800',
    'in-progress': 'border-blue-100 dark:border-blue-900/30',
    completed: 'border-emerald-100 dark:border-emerald-900/30',
  };

  return (
    <div className='flex flex-col h-full flex-1 min-w-[320px] max-w-[450px]'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <h2 className='text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider'>
            {title}
          </h2>
          <span className='flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400'>
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 rounded-2xl border-2 border-dashed transition-all duration-200 overflow-y-auto min-h-[500px]',
          statusColors[id],
          isOver ? 'border-primary-400 ring-2 ring-primary-400/20' : borderColors[id],
        )}
      >
        <div className='flex flex-col gap-3'>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
          {tasks.length === 0 && !isOver && (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3'>
                <Plus className='w-6 h-6 text-slate-300 dark:text-slate-600' />
              </div>
              <p className='text-xs text-slate-400 dark:text-slate-500 font-medium'>No tasks yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
