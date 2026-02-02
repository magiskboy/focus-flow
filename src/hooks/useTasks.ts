import { useAtom } from 'jotai';
import { useEffect, useCallback } from 'react';
import { tasksAtom } from '@/store/atoms';
import { taskService } from '@/services/taskService';
import type { Task, TaskStatus } from '@/types/task';
import { arrayMove } from '@dnd-kit/sortable';

export function useTasks() {
  const [tasks, setTasks] = useAtom(tasksAtom);

  const loadTasks = useCallback(async () => {
    const loadedTasks = await taskService.getTasks();
    if (loadedTasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Welcome to FocusFlow 🚀',
          description: 'Try dragging this task to "In Progress"!',
          status: 'todo',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: ['tutorial'],
          order: 0,
        },
        {
          id: '2',
          title: 'Offline First',
          description: 'All your data is stored locally in your browser.',
          status: 'in-progress',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: ['privacy'],
          order: 0,
        },
        {
          id: '3',
          title: 'Strict Privacy',
          description: 'No data ever leaves your device.',
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: 0,
        },
      ];
      for (const task of sampleTasks) {
        await taskService.saveTask(task);
      }
      setTasks(sampleTasks);
    } else {
      setTasks(loadedTasks);
    }
  }, [setTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (taskData: Partial<Task> & { title: string }) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      status: 'todo',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: tasks.length,
      ...taskData,
    };
    await taskService.saveTask(newTask);
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updatedAt = Date.now();
    await taskService.updateTask(taskId, { ...updates, updatedAt });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt } : t)));
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const reorderTasks = async (activeId: string, overId: string) => {
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      const newTasks = arrayMove(prev, oldIndex, newIndex);

      // Persist the new order (simplified: update all affected for now)
      newTasks.forEach((task, index) => {
        if (task.order !== index) {
          taskService.updateTask(task.id, { order: index });
        }
      });

      return newTasks.map((t, i) => ({ ...t, order: i }));
    });
  };

  const deleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return {
    tasks,
    addTask,
    updateTask,
    updateTaskStatus,
    reorderTasks,
    deleteTask,
    refreshTasks: loadTasks,
  };
}
