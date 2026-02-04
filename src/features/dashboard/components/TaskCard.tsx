import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import { cn } from '@/utils/cn';
import { Calendar, CheckCircle2, Circle, Clock, Timer, ListChecks } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { selectedTaskIdAtom } from '@/store/atoms';

interface TaskCardProps {
  task: Task;
  isStatic?: boolean;
}

export function TaskCard({ task, isStatic = false }: TaskCardProps) {
  const setSelectedTaskId = useSetAtom(selectedTaskIdAtom);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isStatic,
    data: {
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const statusIcons = {
    todo: <Circle className='w-4 h-4 text-slate-400' />,
    'in-progress': <Clock className='w-4 h-4 text-blue-500 animate-pulse' />,
    completed: <CheckCircle2 className='w-4 h-4 text-emerald-500' />,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => setSelectedTaskId(task.id)}
      className={cn(
        'group relative bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:shadow-md',
        isDragging && 'opacity-0',
        isStatic && 'z-50 shadow-2xl border-blue-500/50 cursor-grabbing',
      )}
    >
      <div className='flex items-start justify-between gap-3 mb-2'>
        <div className='flex-1'>
          <h3
            className={cn(
              'text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight',
              task.status === 'completed' && 'line-through text-slate-500 dark:text-slate-500',
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2'>
              {task.description}
            </p>
          )}
        </div>
        <div className='mt-0.5'>{statusIcons[task.status]}</div>
      </div>

      <div className='flex items-center gap-3 mt-4'>
        {task.dueDate && (
          <div className='flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400'>
            <Calendar className='w-3 h-3' />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
        {task.estimatedPomodoros && (
          <div className='flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400'>
            <Timer className='w-3 h-3' />
            {task.completedPomodoros || 0}/{task.estimatedPomodoros}
          </div>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className='flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400'>
            <ListChecks className='w-3 h-3' />
            <span>
              {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
            </span>
          </div>
        )}
        <div className='flex-1' />
        {task.tags?.map((tag) => (
          <span
            key={tag}
            className='px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-300'
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
