import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { createStore } from 'jotai/vanilla';
import { Provider } from 'jotai';
import { TaskDetailDialog } from './TaskDetailDialog';
import { tasksAtom, selectedTaskIdAtom } from '@/store/atoms';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: 'detail-task-1',
  title: 'Task to edit',
  description: 'Some notes',
  status: 'in-progress',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: ['work'],
  estimatedPomodoros: 2,
};

const mockUpdateTask = vi.fn().mockResolvedValue(undefined);
const mockDeleteTask = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
  }),
}));

function renderWithSelectedTask(task: Task) {
  const store = createStore();
  store.set(tasksAtom, [task]);
  store.set(selectedTaskIdAtom, task.id);
  return render(
    <Provider store={store}>
      <TaskDetailDialog />
    </Provider>,
  );
}

function renderWithNoTask() {
  const store = createStore();
  store.set(tasksAtom, []);
  store.set(selectedTaskIdAtom, null);
  return render(
    <Provider store={store}>
      <TaskDetailDialog />
    </Provider>,
  );
}

describe('TaskDetailDialog', () => {
  const originalConfirm = window.confirm;

  beforeEach(() => {
    mockUpdateTask.mockClear();
    mockDeleteTask.mockClear();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  it('renders nothing when no task selected', () => {
    const { container } = renderWithNoTask();
    expect(container.firstChild).toBeNull();
  });

  it('renders Edit Task modal with task title when task selected', () => {
    renderWithSelectedTask(mockTask);
    expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Task to edit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Some notes')).toBeInTheDocument();
  });

  it('Save button is disabled when title is empty', () => {
    renderWithSelectedTask(mockTask);
    const titleInput = screen.getByPlaceholderText(/What needs to be done/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeDisabled();
  });

  it('calls updateTask and closes when Save is clicked', async () => {
    renderWithSelectedTask(mockTask);
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({
          title: 'Task to edit',
          status: 'in-progress',
        }),
      );
    });
  });

  it('calls deleteTask when Delete is clicked and user confirms', async () => {
    window.confirm = vi.fn(() => true);
    renderWithSelectedTask(mockTask);

    fireEvent.click(screen.getByRole('button', { name: /Delete Task/i }));

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
    });
  });

  it('closes when Cancel is clicked', async () => {
    renderWithSelectedTask(mockTask);
    expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Edit Task/i })).not.toBeInTheDocument();
    });
  });

  it('updates status when status option is selected', async () => {
    renderWithSelectedTask(mockTask);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /In Progress/i }));
    });
    const completedOption = screen.getByRole('button', { name: /Completed/i });
    await act(async () => {
      fireEvent.click(completedOption);
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    });
    expect(mockUpdateTask).toHaveBeenCalledWith(
      mockTask.id,
      expect.objectContaining({ status: 'completed' }),
    );
  });

  it('adds tag when typing and pressing Enter in tag input', () => {
    renderWithSelectedTask(mockTask);
    const tagInput = screen.getByPlaceholderText(/\+ Add tag/i);
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    expect(screen.getByText('newtag')).toBeInTheDocument();
  });

  it('calls updateTask with changed description when Save is clicked', async () => {
    renderWithSelectedTask(mockTask);
    const notesInput = screen.getByPlaceholderText(/Add more details/i);
    fireEvent.change(notesInput, { target: { value: 'Updated notes' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({ description: 'Updated notes' }),
      );
    });
  });

  it('does not call deleteTask when user cancels confirm', async () => {
    window.confirm = vi.fn(() => false);
    renderWithSelectedTask(mockTask);

    fireEvent.click(screen.getByRole('button', { name: /Delete Task/i }));

    await waitFor(() => {
      expect(mockDeleteTask).not.toHaveBeenCalled();
    });
    expect(screen.getByRole('heading', { name: /Edit Task/i })).toBeInTheDocument();
  });

  it('removes last tag when Backspace is pressed with empty tag input', () => {
    renderWithSelectedTask(mockTask);
    const tagInput = screen.getByPlaceholderText(/\+ Add tag/i);
    fireEvent.change(tagInput, { target: { value: 'extra' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    expect(screen.getByText('extra')).toBeInTheDocument();
    fireEvent.keyDown(tagInput, { key: 'Backspace' });
    expect(screen.queryByText('extra')).not.toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
  });
});
