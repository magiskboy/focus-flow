import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { useTasks } from './useTasks';
import type { Task } from '@/types/task';

const mocks = vi.hoisted(() => ({
  mockGetTasks: vi.fn().mockResolvedValue([]),
  mockSaveTask: vi.fn().mockResolvedValue(undefined),
  mockUpdateTask: vi.fn().mockResolvedValue(undefined),
  mockDeleteTask: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/services/taskService', () => ({
  taskService: {
    getTasks: mocks.mockGetTasks,
    saveTask: mocks.mockSaveTask,
    updateTask: mocks.mockUpdateTask,
    deleteTask: mocks.mockDeleteTask,
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return <JotaiProvider>{children}</JotaiProvider>;
}

describe('useTasks', () => {
  beforeEach(() => {
    mocks.mockGetTasks.mockClear();
    mocks.mockSaveTask.mockClear();
    mocks.mockUpdateTask.mockClear();
    mocks.mockDeleteTask.mockClear();
    mocks.mockGetTasks.mockResolvedValue([]);
  });

  it('loads tasks on mount', async () => {
    renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(mocks.mockGetTasks).toHaveBeenCalled();
    });
  });

  it('seeds sample tasks when getTasks returns empty', async () => {
    renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(mocks.mockGetTasks).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mocks.mockSaveTask).toHaveBeenCalled();
    });
  });

  it('addTask creates and saves a new task', async () => {
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(mocks.mockGetTasks).toHaveBeenCalled();
    });
    mocks.mockGetTasks.mockResolvedValue([]);

    await act(async () => {
      await result.current.addTask({ title: 'New task' });
    });

    expect(mocks.mockSaveTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        status: 'todo',
      }),
    );
  });

  it('updateTaskStatus calls taskService.updateTask', async () => {
    mocks.mockGetTasks.mockResolvedValue([
      { id: '1', title: 'T', status: 'todo', createdAt: 1, updatedAt: 1 },
    ] as Task[]);
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(result.current.tasks.length).toBe(1);
    });

    await act(async () => {
      await result.current.updateTaskStatus('1', 'in-progress');
    });

    expect(mocks.mockUpdateTask).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ status: 'in-progress' }),
    );
  });

  it('deleteTask removes task and calls taskService.deleteTask', async () => {
    mocks.mockGetTasks.mockResolvedValue([
      { id: '1', title: 'T', status: 'todo', createdAt: 1, updatedAt: 1 },
    ] as Task[]);
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(result.current.tasks.length).toBe(1);
    });

    await act(async () => {
      await result.current.deleteTask('1');
    });

    expect(mocks.mockDeleteTask).toHaveBeenCalledWith('1');
    expect(result.current.tasks).toHaveLength(0);
  });

  it('reorderTasks reorders list', async () => {
    mocks.mockGetTasks.mockResolvedValue([
      { id: 'a', title: 'A', status: 'todo', createdAt: 1, updatedAt: 1, order: 0 },
      { id: 'b', title: 'B', status: 'todo', createdAt: 2, updatedAt: 2, order: 1 },
    ] as Task[]);
    const { result } = renderHook(() => useTasks(), { wrapper });
    await waitFor(() => {
      expect(result.current.tasks.length).toBe(2);
    });

    await act(async () => {
      result.current.reorderTasks('a', 'b');
    });

    expect(result.current.tasks[0].id).toBe('b');
    expect(result.current.tasks[1].id).toBe('a');
  });
});
