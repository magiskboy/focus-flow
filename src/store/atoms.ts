import { atom } from 'jotai';
import type { Task } from '@/types/task';
import type { AppSettings } from '@/types/settings';
import { atomWithStorage } from 'jotai/utils';

// Persistent Settings Atom
export const settingsAtom = atomWithStorage<AppSettings>('focusflow-settings', {
  pomodoro: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true,
  },
  theme: {
    mode: 'system',
  },
});

// In-memory Atoms for Tasks (will be synced with IndexedDB via effects/hooks later)
export const tasksAtom = atom<Task[]>([]);
export const selectedTaskIdAtom = atom<string | null>(null);

// Derived Atoms
export const sortedTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  // Sort by created date desc for now
  return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
});

export const selectedTaskAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const selectedId = get(selectedTaskIdAtom);
  return tasks.find((t) => t.id === selectedId) || null;
});

export const activeTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.filter((t) => t.status !== 'completed');
});
