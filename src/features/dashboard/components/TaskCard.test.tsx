import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { TaskCard } from './TaskCard';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test task title',
  description: 'Test description',
  status: 'todo',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: ['tag1', 'tag2'],
  estimatedPomodoros: 2,
  completedPomodoros: 0,
};

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: () => {},
    attributes: {},
    listeners: {},
    transform: null,
    transition: null,
    isDragging: false,
    setActivatorNodeRef: () => {},
  }),
}));

function renderWithProvider(ui: ReactElement) {
  return render(<JotaiProvider>{ui}</JotaiProvider>);
}

describe('TaskCard', () => {
  it('renders task title and description', () => {
    renderWithProvider(<TaskCard task={mockTask} isStatic={true} />);
    expect(screen.getByText('Test task title')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderWithProvider(<TaskCard task={mockTask} isStatic={true} />);
    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
  });

  it('shows pomodoro count when estimatedPomodoros is set', () => {
    renderWithProvider(<TaskCard task={mockTask} isStatic={true} />);
    expect(screen.getByText(/0\/2/)).toBeInTheDocument();
  });

  it('renders title only when task has no description', () => {
    const taskWithoutDesc: Task = {
      ...mockTask,
      id: 'no-desc',
      title: 'No description task',
      description: undefined,
    };
    renderWithProvider(<TaskCard task={taskWithoutDesc} isStatic={true} />);
    expect(screen.getByText('No description task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('does not render due date when task has no dueDate', () => {
    const taskWithoutDue: Task = {
      ...mockTask,
      dueDate: undefined,
    };
    renderWithProvider(<TaskCard task={taskWithoutDue} isStatic={true} />);
    expect(screen.getByText('Test task title')).toBeInTheDocument();
    expect(screen.queryByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).not.toBeInTheDocument();
  });

  it('renders due date when task has dueDate', () => {
    const taskWithDue: Task = {
      ...mockTask,
      dueDate: new Date(2025, 0, 15).getTime(),
    };
    renderWithProvider(<TaskCard task={taskWithDue} isStatic={true} />);
    expect(screen.getByText('Test task title')).toBeInTheDocument();
    // Locale-agnostic: component uses toLocaleDateString(); assert year and day
    const dueText = screen.getByText(/2025/);
    expect(dueText).toHaveTextContent(/15/);
  });

  it('does not render tags when task has no tags', () => {
    const taskWithoutTags: Task = {
      ...mockTask,
      id: 'no-tags',
      title: 'No tags task',
      tags: undefined,
    };
    renderWithProvider(<TaskCard task={taskWithoutTags} isStatic={true} />);
    expect(screen.getByText('No tags task')).toBeInTheDocument();
    expect(screen.queryByText('#tag1')).not.toBeInTheDocument();
  });

  it('does not render pomodoro count when estimatedPomodoros is not set', () => {
    const taskWithoutPomodoro: Task = {
      ...mockTask,
      id: 'no-pom',
      title: 'No pomodoro task',
      estimatedPomodoros: undefined,
      completedPomodoros: undefined,
    };
    renderWithProvider(<TaskCard task={taskWithoutPomodoro} isStatic={true} />);
    expect(screen.getByText('No pomodoro task')).toBeInTheDocument();
    expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
  });

  it('renders completed task with title', () => {
    const completedTask: Task = {
      ...mockTask,
      id: 'completed-1',
      title: 'Done task',
      status: 'completed',
    };
    renderWithProvider(<TaskCard task={completedTask} isStatic={true} />);
    expect(screen.getByText('Done task')).toBeInTheDocument();
  });

  it('renders with isStatic false (draggable)', () => {
    renderWithProvider(<TaskCard task={mockTask} isStatic={false} />);
    expect(screen.getByText('Test task title')).toBeInTheDocument();
  });
});
