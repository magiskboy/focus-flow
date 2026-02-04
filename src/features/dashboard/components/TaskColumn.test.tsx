import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { TaskColumn } from './TaskColumn';
import type { Task } from '@/types/task';
import * as dndCore from '@dnd-kit/core';

const mockTask: Task = {
  id: 'task-1',
  title: 'Column task',
  description: 'In this column',
  status: 'todo',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
    active: null,
    rect: { current: null },
    node: { current: null },
    over: null,
  })),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sortable-context'>{children}</div>
  ),
  verticalListSortingStrategy: {},
}));

vi.mock('./TaskCard', () => ({
  TaskCard: ({ task }: { task: Task }) => <div data-testid='task-card'>{task.title}</div>,
}));

function renderWithProvider(ui: ReactElement) {
  return render(<JotaiProvider>{ui}</JotaiProvider>);
}

describe('TaskColumn', () => {
  it('renders column title and task count', () => {
    renderWithProvider(<TaskColumn id='todo' title='To Do' tasks={[mockTask]} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    renderWithProvider(<TaskColumn id='todo' title='To Do' tasks={[]} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('renders task cards when tasks provided', () => {
    renderWithProvider(<TaskColumn id='todo' title='To Do' tasks={[mockTask]} />);
    expect(screen.getByTestId('task-card')).toBeInTheDocument();
    expect(screen.getByText('Column task')).toBeInTheDocument();
  });

  it('applies drag-over styling when isOver is true', () => {
    vi.mocked(dndCore.useDroppable).mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: true,
      active: null,
      rect: { current: null },
      node: { current: null },
      over: null,
    });
    renderWithProvider(<TaskColumn id='todo' title='To Do' tasks={[mockTask]} />);
    const droppable = screen.getByTestId('column-drop-target');
    expect(droppable).toHaveAttribute('data-over', 'true');
    vi.mocked(dndCore.useDroppable).mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: false,
      active: null,
      rect: { current: null },
      node: { current: null },
      over: null,
    });
  });
});
