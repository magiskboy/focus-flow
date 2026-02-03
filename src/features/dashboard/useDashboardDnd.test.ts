import { renderHook, act } from '@testing-library/react';
import { useDashboardDnd } from './useDashboardDnd';
import type { Task } from '@/types/task';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test task',
  status: 'todo',
  createdAt: 1,
  updatedAt: 1,
  order: 0,
};

const mockUpdateTaskStatus = vi.fn().mockResolvedValue(undefined);
const mockReorderTasks = vi.fn().mockResolvedValue(undefined);

function createDragStartEvent(activeId: string, task: Task): DragStartEvent {
  return {
    active: {
      id: activeId,
      data: { current: { task } },
      rect: { current: { initial: null } },
    },
  } as unknown as DragStartEvent;
}

function createDragEndEvent(
  activeId: string,
  overId: string,
  activeTask?: Task,
  overTask?: Task,
): DragEndEvent {
  return {
    active: {
      id: activeId,
      data: { current: activeTask ? { task: activeTask } : undefined },
      rect: { current: { initial: null } },
    },
    over: {
      id: overId,
      data: { current: overTask ? { task: overTask } : undefined },
      rect: { current: null },
    },
  } as unknown as DragEndEvent;
}

describe('useDashboardDnd', () => {
  beforeEach(() => {
    mockUpdateTaskStatus.mockClear();
    mockReorderTasks.mockClear();
  });

  it('sets activeTask on handleDragStart when task is found', () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    expect(result.current.activeTask).toBeNull();

    act(() => {
      result.current.handleDragStart(createDragStartEvent('task-1', mockTask));
    });

    expect(result.current.activeTask).toEqual(mockTask);
  });

  it('does not set activeTask when task is not found', () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    act(() => {
      result.current.handleDragStart(createDragStartEvent('unknown-id', mockTask));
    });

    expect(result.current.activeTask).toBeNull();
  });

  it('clears activeTask and calls updateTaskStatus when dropping on a column with different status', async () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    act(() => {
      result.current.handleDragStart(createDragStartEvent('task-1', mockTask));
    });
    expect(result.current.activeTask).toEqual(mockTask);

    await act(async () => {
      result.current.handleDragEnd(
        createDragEndEvent('task-1', 'in-progress', mockTask, undefined),
      );
    });

    expect(result.current.activeTask).toBeNull();
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task-1', 'in-progress');
    expect(mockReorderTasks).not.toHaveBeenCalled();
  });

  it('does not call updateTaskStatus when dropping on same status column', async () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    await act(async () => {
      result.current.handleDragEnd(createDragEndEvent('task-1', 'todo', mockTask, undefined));
    });

    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
  });

  it('does not call updateTaskStatus when dropping on column but active has no task data', async () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    act(() => {
      result.current.handleDragStart(createDragStartEvent('task-1', mockTask));
    });

    await act(async () => {
      result.current.handleDragEnd(
        createDragEndEvent('task-1', 'in-progress', undefined, undefined),
      );
    });

    expect(result.current.activeTask).toBeNull();
    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
  });

  it('clears activeTask when handleDragEnd has no over', async () => {
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask], mockUpdateTaskStatus, mockReorderTasks),
    );

    act(() => {
      result.current.handleDragStart(createDragStartEvent('task-1', mockTask));
    });

    await act(async () => {
      result.current.handleDragEnd({
        active: {
          id: 'task-1',
          data: { current: { task: mockTask } },
          rect: { current: { initial: null } },
        },
        over: null,
      } as unknown as DragEndEvent);
    });

    expect(result.current.activeTask).toBeNull();
    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
  });

  it('calls reorderTasks and updateTaskStatus when reordering to different status task', async () => {
    const task2: Task = {
      id: 'task-2',
      title: 'Second',
      status: 'in-progress',
      createdAt: 2,
      updatedAt: 2,
      order: 1,
    };
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask, task2], mockUpdateTaskStatus, mockReorderTasks),
    );

    await act(async () => {
      result.current.handleDragEnd(createDragEndEvent('task-1', 'task-2', mockTask, task2));
    });

    expect(result.current.activeTask).toBeNull();
    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task-1', 'in-progress');
    expect(mockReorderTasks).toHaveBeenCalledWith('task-1', 'task-2');
  });

  it('calls reorderTasks only when reordering within same status', async () => {
    const task2: Task = {
      id: 'task-2',
      title: 'Second',
      status: 'todo',
      createdAt: 2,
      updatedAt: 2,
      order: 1,
    };
    const { result } = renderHook(() =>
      useDashboardDnd([mockTask, task2], mockUpdateTaskStatus, mockReorderTasks),
    );

    await act(async () => {
      result.current.handleDragEnd(createDragEndEvent('task-1', 'task-2', mockTask, task2));
    });

    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
    expect(mockReorderTasks).toHaveBeenCalledWith('task-1', 'task-2');
  });
});
