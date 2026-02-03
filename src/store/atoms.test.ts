import { createStore } from 'jotai/vanilla';
import {
  tasksAtom,
  selectedTaskIdAtom,
  sortedTasksAtom,
  selectedTaskAtom,
  activeTasksAtom,
} from './atoms';
import type { Task } from '@/types/task';

describe('atoms', () => {
  const task1: Task = { id: '1', title: 'First', status: 'todo', createdAt: 100, updatedAt: 100 };
  const task2: Task = {
    id: '2',
    title: 'Second',
    status: 'in-progress',
    createdAt: 200,
    updatedAt: 200,
  };
  const task3: Task = {
    id: '3',
    title: 'Third',
    status: 'completed',
    createdAt: 300,
    updatedAt: 300,
  };

  it('sortedTasksAtom returns tasks sorted by createdAt desc', () => {
    const store = createStore();
    store.set(tasksAtom, [task1, task2, task3]);
    const sorted = store.get(sortedTasksAtom);
    expect(sorted.map((t) => t.id)).toEqual(['3', '2', '1']);
  });

  it('selectedTaskAtom returns task when selectedTaskId is set', () => {
    const store = createStore();
    store.set(tasksAtom, [task1, task2]);
    store.set(selectedTaskIdAtom, '2');
    const selected = store.get(selectedTaskAtom);
    expect(selected).toEqual(task2);
  });

  it('selectedTaskAtom returns null when no selection', () => {
    const store = createStore();
    store.set(tasksAtom, [task1]);
    store.set(selectedTaskIdAtom, null);
    const selected = store.get(selectedTaskAtom);
    expect(selected).toBeNull();
  });

  it('activeTasksAtom filters out completed tasks', () => {
    const store = createStore();
    store.set(tasksAtom, [task1, task2, task3]);
    const active = store.get(activeTasksAtom);
    expect(active).toHaveLength(2);
    expect(active.map((t) => t.status)).toEqual(['todo', 'in-progress']);
  });
});
