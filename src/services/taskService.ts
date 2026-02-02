import { IndexedDBAdapter } from './storage/indexeddb';
import type { Task } from '@/types/task';

class TaskService extends IndexedDBAdapter<Task> {
  constructor() {
    super('tasks');
  }

  async getTasks(): Promise<Task[]> {
    return this.getAll();
  }

  async saveTask(task: Task): Promise<void> {
    await this.create(task);
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    await this.update(id, updates);
  }

  async deleteTask(id: string): Promise<void> {
    await this.delete(id);
  }
}

export const taskService = new TaskService();
