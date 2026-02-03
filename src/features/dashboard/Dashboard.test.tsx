import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createStore } from 'jotai/vanilla';
import { Dashboard } from './Dashboard';
import type { Task } from '@/types/task';
import { useDashboardDnd } from './useDashboardDnd';
import { selectedTaskIdAtom, tasksAtom } from '@/store/atoms';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Todo task',
    description: 'Desc',
    status: 'todo',
    createdAt: 1,
    updatedAt: 1,
    order: 0,
  },
  {
    id: '2',
    title: 'In progress task',
    description: 'Secret notes here',
    status: 'in-progress',
    createdAt: 2,
    updatedAt: 2,
    order: 0,
  },
  {
    id: '3',
    title: 'Done task',
    description: undefined,
    status: 'completed',
    createdAt: 3,
    updatedAt: 3,
    order: undefined,
  },
  {
    id: '4',
    title: 'Another done',
    description: undefined,
    status: 'completed',
    createdAt: 4,
    updatedAt: 4,
    order: undefined,
  },
];

const mockUpdateTaskStatus = vi.fn().mockResolvedValue(undefined);
const mockReorderTasks = vi.fn();

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    tasks: mockTasks,
    updateTaskStatus: mockUpdateTaskStatus,
    reorderTasks: mockReorderTasks,
    addTask: vi.fn().mockResolvedValue(undefined),
    updateTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    refreshTasks: vi.fn().mockResolvedValue(undefined),
  }),
}));

const mockHandleDragStart = vi.fn();
const mockHandleDragEnd = vi.fn();
vi.mock('./useDashboardDnd', () => ({
  useDashboardDnd: vi.fn(() => ({
    activeTask: null,
    handleDragStart: mockHandleDragStart,
    handleDragEnd: mockHandleDragEnd,
  })),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dnd-context'>{children}</div>
  ),
  DragOverlay: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='drag-overlay'>{children}</div>
  ),
  PointerSensor: () => null,
  useSensor: () => ({}),
  useSensors: () => [],
  useDroppable: () => ({ setNodeRef: () => {}, isOver: false }),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
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

vi.mock('./components/TaskColumn', () => ({
  TaskColumn: ({ title, tasks }: { title: string; tasks: Task[] }) => (
    <div data-testid={`column-${title}`}>
      <span>{title}</span>
      <span>{tasks.length}</span>
      {tasks.map((t) => (
        <div key={t.id}>{t.title}</div>
      ))}
    </div>
  ),
}));

function renderDashboard() {
  return render(
    <JotaiProvider>
      <Dashboard />
    </JotaiProvider>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    mockUpdateTaskStatus.mockClear();
    mockReorderTasks.mockClear();
  });

  it('renders toolbar with Dashboard title and Add Task', () => {
    renderDashboard();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });

  it('renders three columns', () => {
    renderDashboard();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders tasks in columns', () => {
    renderDashboard();
    expect(screen.getByText('Todo task')).toBeInTheDocument();
    expect(screen.getByText('In progress task')).toBeInTheDocument();
  });

  it('filters tasks by search query', () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'progress' } });
    expect(screen.getByText('In progress task')).toBeInTheDocument();
    expect(screen.queryByText('Todo task')).not.toBeInTheDocument();
  });

  it('filters tasks by description when search matches description only', () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'Secret' } });
    expect(screen.getByText('In progress task')).toBeInTheDocument();
    expect(screen.queryByText('Todo task')).not.toBeInTheDocument();
  });

  it('opens Create Task dialog when Add Task is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    expect(screen.getByRole('heading', { name: /Create New Task/i })).toBeInTheDocument();
  });

  it('closes Create Task dialog when Cancel is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    expect(screen.getByRole('heading', { name: /Create New Task/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByRole('heading', { name: /Create New Task/i })).not.toBeInTheDocument();
  });

  it('renders drag overlay with task when activeTask is set', () => {
    vi.mocked(useDashboardDnd).mockReturnValue({
      activeTask: mockTasks[0],
      handleDragStart: mockHandleDragStart,
      handleDragEnd: mockHandleDragEnd,
    });
    renderDashboard();
    const overlay = screen.getByTestId('drag-overlay');
    expect(within(overlay).getByText('Todo task')).toBeInTheDocument();
    vi.mocked(useDashboardDnd).mockReturnValue({
      activeTask: null,
      handleDragStart: mockHandleDragStart,
      handleDragEnd: mockHandleDragEnd,
    });
  });

  it('renders completed task in Completed column', () => {
    renderDashboard();
    expect(screen.getByText('Done task')).toBeInTheDocument();
    const completedColumn = screen.getByTestId('column-Completed');
    expect(within(completedColumn).getByText('Done task')).toBeInTheDocument();
  });

  it('filters to no tasks when search matches nothing', () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'nomatchxyz' } });
    expect(screen.queryByText('Todo task')).not.toBeInTheDocument();
    expect(screen.queryByText('In progress task')).not.toBeInTheDocument();
    expect(screen.queryByText('Done task')).not.toBeInTheDocument();
  });

  it('includes task with no description when search matches title only', () => {
    renderDashboard();
    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'Done' } });
    expect(screen.getByText('Done task')).toBeInTheDocument();
    expect(screen.queryByText('Todo task')).not.toBeInTheDocument();
  });

  it('renders Edit Task dialog when a task is selected', () => {
    const store = createStore();
    store.set(tasksAtom, mockTasks);
    store.set(selectedTaskIdAtom, '1');
    render(
      <JotaiProvider store={store}>
        <Dashboard />
      </JotaiProvider>,
    );
    expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Todo task')).toBeInTheDocument();
  });
});
