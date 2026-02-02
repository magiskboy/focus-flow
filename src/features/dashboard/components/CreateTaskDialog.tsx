import { useState } from 'react';
import { Modal } from '@/components';
import { useTasks } from '@/hooks/useTasks';
import { Timer, Tag, AlignLeft, Type } from 'lucide-react';

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaskDialog({ isOpen, onClose }: CreateTaskDialogProps) {
  const { addTask } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedPomodoros,
      tags: tags.length > 0 ? tags : undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setEstimatedPomodoros(1);
    setTags([]);
    setTagInput('');
    onClose();
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Create New Task'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Title */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2'>
            <Type className='w-3 h-3' />
            Task Title
          </label>
          <input
            autoFocus
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='What needs to be done?'
            className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100'
            required
          />
        </div>

        {/* Description */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2'>
            <AlignLeft className='w-3 h-3' />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Add some details...'
            rows={3}
            className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none text-slate-900 dark:text-slate-100'
          />
        </div>

        {/* Estimated Pomodoros & Tags */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2'>
              <Timer className='w-3 h-3' />
              Est. Pomodoros
            </label>
            <input
              type='number'
              min={1}
              max={10}
              value={estimatedPomodoros}
              onChange={(e) => setEstimatedPomodoros(parseInt(e.target.value) || 1)}
              className='w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-slate-100'
            />
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2'>
              <Tag className='w-3 h-3' />
              Tags
            </label>
            <div className='flex flex-wrap items-center gap-2 p-1.5 min-h-[46px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-500/20 animate-in zoom-in-95 duration-200'
                >
                  {tag}
                  <button
                    type='button'
                    onClick={() => removeTag(tag)}
                    className='hover:text-blue-800 dark:hover:text-blue-200 transition-colors'
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type='text'
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? 'Comma or Enter...' : ''}
                className='flex-1 min-w-[60px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-2'
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <button
            type='button'
            onClick={handleClose}
            className='px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={!title.trim()}
            className='px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95'
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
