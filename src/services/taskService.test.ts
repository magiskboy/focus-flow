import { vi } from 'vitest';
import { taskService } from './taskService';
import type { Task } from '@/types/task';

const mocks = vi.hoisted(() => ({
  mockGetAll: vi.fn().mockResolvedValue([]),
  mockGet: vi.fn().mockResolvedValue(undefined),
  mockPut: vi.fn().mockResolvedValue(undefined),
  mockDelete: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('idb', () => ({
  openDB: vi.fn(() =>
    Promise.resolve({
      getAll: mocks.mockGetAll,
      get: mocks.mockGet,
      put: mocks.mockPut,
      delete: mocks.mockDelete,
    }),
  ),
}));

describe('taskService', () => {
  beforeEach(() => {
    mocks.mockGetAll.mockClear();
    mocks.mockGet.mockClear();
    mocks.mockPut.mockClear();
    mocks.mockDelete.mockClear();
    mocks.mockGetAll.mockResolvedValue([]);
  });

  it('getTasks returns all tasks from store', async () => {
    const tasks: Task[] = [{ id: '1', title: 'T', status: 'todo', createdAt: 1, updatedAt: 1 }];
    mocks.mockGetAll.mockResolvedValue(tasks);
    const result = await taskService.getTasks();
    expect(mocks.mockGetAll).toHaveBeenCalledWith('tasks');
    expect(result).toEqual(tasks);
  });

  it('saveTask puts task into store', async () => {
    const task: Task = { id: '1', title: 'T', status: 'todo', createdAt: 1, updatedAt: 1 };
    await taskService.saveTask(task);
    expect(mocks.mockPut).toHaveBeenCalledWith('tasks', task);
  });

  it('updateTask gets existing then puts merged', async () => {
    const existing: Task = { id: '1', title: 'T', status: 'todo', createdAt: 1, updatedAt: 1 };
    mocks.mockGet.mockResolvedValue(existing);
    await taskService.updateTask('1', { title: 'Updated' });
    expect(mocks.mockGet).toHaveBeenCalledWith('tasks', '1');
    expect(mocks.mockPut).toHaveBeenCalledWith(
      'tasks',
      expect.objectContaining({ title: 'Updated' }),
    );
  });

  it('deleteTask deletes from store', async () => {
    await taskService.deleteTask('1');
    expect(mocks.mockDelete).toHaveBeenCalledWith('tasks', '1');
  });
});
