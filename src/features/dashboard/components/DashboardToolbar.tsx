import { Search, Plus, LayoutGrid } from 'lucide-react';

interface DashboardToolbarProps {
  onSearchChange: (value: string) => void;
  onAddTaskClick: () => void;
  searchQuery: string;
}

export function DashboardToolbar({
  onSearchChange,
  onAddTaskClick,
  searchQuery,
}: DashboardToolbarProps) {
  return (
    <header className='px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30'>
              <LayoutGrid className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-lg font-bold text-slate-900 dark:text-slate-100 hidden sm:block'>
              Dashboard
            </h1>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative group flex-1 md:w-64'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Search tasks...'
              className='w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all'
            />
          </div>

          <button
            onClick={onAddTaskClick}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-95'
          >
            <Plus className='w-4 h-4' />
            <span className='hidden sm:inline'>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
