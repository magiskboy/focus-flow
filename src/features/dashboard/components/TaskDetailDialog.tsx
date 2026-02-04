import { useState } from 'react';
import { useAtom } from 'jotai';
import { selectedTaskIdAtom, selectedTaskAtom } from '@/store/atoms';
import { Modal } from '@/components';
import { useTasks } from '@/hooks/useTasks';
import {
  Timer,
  Tag,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  AlignLeft,
  X,
  CheckSquare,
  Square,
  Plus,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { TaskStatus, Subtask } from '@/types/task';

export function TaskDetailDialog() {
  const [selectedTask] = useAtom(selectedTaskAtom);
  const [, setSelectedTaskId] = useAtom(selectedTaskIdAtom);
  const { updateTask, deleteTask } = useTasks();

  const [title, setTitle] = useState(selectedTask?.title || '');
  const [description, setDescription] = useState(selectedTask?.description || '');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    selectedTask?.estimatedPomodoros || 1,
  );
  const [tags, setTags] = useState<string[]>(selectedTask?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState<TaskStatus>(selectedTask?.status || 'todo');
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Subtasks local state
  const [subtasks, setSubtasks] = useState<Subtask[]>(selectedTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleClose = () => {
    setSelectedTaskId(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedTask || !title.trim()) return;

    await updateTask(selectedTask.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedPomodoros,
      tags: tags.length > 0 ? tags : undefined,
      status,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    });

    handleClose();
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(selectedTask.id);
      handleClose();
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Subtask handlers
  const handleAddSubtask = (e: React.FormEvent | React.KeyboardEvent) => {
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

  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)),
    );
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
  };

  if (!selectedTask) return null;

  const statusOptions: {
    value: TaskStatus;
    label: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }[] = [
    {
      value: 'todo',
      label: 'To Do',
      icon: <Circle className='w-4 h-4' />,
      color: 'text-slate-500',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
    },
    {
      value: 'in-progress',
      label: 'In Progress',
      icon: <Clock className='w-4 h-4' />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className='w-4 h-4' />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  const currentStatus = statusOptions.find((o) => o.value === status) || statusOptions[0];

  // Calculate subtask progress
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPercentage =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <Modal
      isOpen={!!selectedTask}
      onClose={handleClose}
      title='Edit Task'
      width={900}
      height='90vh'
    >
      <form onSubmit={handleSubmit} className='flex flex-col h-full gap-6'>
        <div className='shrink-0 space-y-6'>
          {/* Title Field */}
          <div className='flex flex-col gap-1.5'>
            <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
              Task Title
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-slate-900 dark:text-slate-100'
              placeholder='What needs to be done?'
              autoFocus
            />
          </div>

          {/* Metadata Row: Status, Estimation, Due Date */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {/* Status Row */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
                Status
              </label>
              <div className='relative'>
                <button
                  type='button'
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800',
                    isStatusOpen && 'ring-2 ring-blue-500/20 border-blue-500',
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-2 text-xs font-medium',
                      currentStatus.color,
                    )}
                  >
                    {currentStatus.icon}
                    <span className='truncate'>{currentStatus.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-slate-400 transition-transform shrink-0',
                      isStatusOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isStatusOpen && (
                  <>
                    <div className='fixed inset-0 z-10' onClick={() => setIsStatusOpen(false)} />
                    <div className='absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
                      <div className='p-1.5 space-y-1'>
                        {statusOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type='button'
                            onClick={() => {
                              setStatus(opt.value);
                              setIsStatusOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                              status === opt.value
                                ? cn(opt.bgColor, opt.color)
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                            )}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Estimation Row */}
            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
                <Timer className='w-3 h-3' />
                Estimate
              </div>
              <div className='flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl h-[38px]'>
                <input
                  type='number'
                  min={1}
                  max={10}
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
                  className='w-full bg-transparent border-none p-0 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-0'
                />
                <span className='text-[10px] text-slate-400 font-medium whitespace-nowrap uppercase'>
                  Pom
                </span>
              </div>
            </div>

            <div className='flex flex-col gap-1.5'>
              <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
                <Tag className='w-3 h-3' />
                Tags
              </div>
              <div className='flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[46px]'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm'
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='text-slate-400 hover:text-rose-500 transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </span>
                ))}
                <input
                  type='text'
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder='+ Add tag'
                  className='flex-1 min-w-[80px] bg-transparent border-none p-0 text-[11px] font-medium text-slate-700 dark:text-slate-300 focus:ring-0'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description Row - Now Flex Fill */}
        <div className='flex flex-col gap-1.5 flex-1 min-h-[150px]'>
          <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
            <AlignLeft className='w-3 h-3' />
            Notes
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Add more details...'
            className='w-full flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-slate-700 dark:text-slate-300 resize-none h-full'
          />
        </div>

        {/* Checklist Section */}
        <div className='shrink-0 space-y-4'>
          <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1'>
            <CheckSquare className='w-3 h-3' />
            Checklist
          </div>

          {/* Progress Bar */}
          {totalSubtasks > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='font-medium text-slate-500 dark:text-slate-400'>Progress</span>
                <span className='font-bold text-slate-700 dark:text-slate-300'>
                  {completedSubtasks}/{totalSubtasks} ({progressPercentage}%)
                </span>
              </div>
              <div className='h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 transition-all duration-300 ease-out'
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Subtasks List */}
          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className='group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors'
              >
                <button
                  type='button'
                  onClick={() => handleToggleSubtask(subtask.id)}
                  className='flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors'
                >
                  {subtask.completed ? (
                    <CheckSquare className='w-4 h-4 text-emerald-500' />
                  ) : (
                    <Square className='w-4 h-4' />
                  )}
                </button>
                <span
                  className={cn(
                    'flex-1 text-sm transition-all truncate',
                    subtask.completed
                      ? 'text-slate-400 dark:text-slate-500 line-through'
                      : 'text-slate-700 dark:text-slate-300',
                  )}
                >
                  {subtask.title}
                </span>
                <button
                  type='button'
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className='opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all'
                >
                  <Trash2 className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className='relative'>
            <input
              type='text'
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              placeholder='+ Add a subtask...'
              className='w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm'
            />
            <Plus className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          </div>
        </div>

        <div className='shrink-0 space-y-6'>
          {/* Tags Row */}

          {/* Footer Actions */}
          <div className='flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800'>
            <button
              type='button'
              onClick={handleDelete}
              className='flex items-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all text-xs font-bold uppercase tracking-widest'
            >
              <Trash2 className='w-4 h-4' />
              Delete Task
            </button>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={handleClose}
                className='px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={!title.trim()}
                className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 active:scale-95'
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
