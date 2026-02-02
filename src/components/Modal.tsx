import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Modal({ isOpen, onClose, title, children, className, width, height }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6`}>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all animate-in zoom-in-95 duration-300 flex flex-col',
          !width && 'max-w-lg',
          className,
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          maxWidth: width ? 'none' : undefined,
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0'>
          <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100'>{title}</h3>
          <button
            onClick={onClose}
            className='p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5 flex-1 overflow-y-auto custom-scrollbar'>{children}</div>
      </div>
    </div>
  );
}
