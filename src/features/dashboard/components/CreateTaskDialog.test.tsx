import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { CreateTaskDialog } from './CreateTaskDialog';

const mockAddTask = vi.fn().mockResolvedValue(undefined);

vi.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    addTask: mockAddTask,
  }),
}));

describe('CreateTaskDialog', () => {
  beforeEach(() => {
    mockAddTask.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<CreateTaskDialog isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with title and form when isOpen is true', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('heading', { name: /Create New Task/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What needs to be done/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('disables Create Task button when title is empty', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /Create Task/i })).toBeDisabled();
  });

  it('calls addTask and onClose when form is submitted with title', async () => {
    const onClose = vi.fn();
    render(<CreateTaskDialog isOpen={true} onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText(/What needs to be done/i);
    fireEvent.change(titleInput, { target: { value: 'My new task' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));

    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My new task',
      }),
    );
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<CreateTaskDialog isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('adds tag when Enter is pressed in tag input', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    const tagInput = screen.getByPlaceholderText(/Comma/);
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('removes tag when tag remove button is clicked', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    const tagInput = screen.getByPlaceholderText(/Comma/);
    fireEvent.change(tagInput, { target: { value: 'urgent' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    const removeButtons = screen.getAllByRole('button', { name: '×' });
    const tagRemoveButton = removeButtons.find((btn) =>
      btn.closest('span')?.textContent?.includes('urgent'),
    );
    if (tagRemoveButton) fireEvent.click(tagRemoveButton);
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
  });

  it('calls addTask with description and estimatedPomodoros when provided', async () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/What needs to be done/i), {
      target: { value: 'Task' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Add some details/i), {
      target: { value: 'Details' },
    });
    const pomodoroInput = screen.getByRole('spinbutton');
    fireEvent.change(pomodoroInput, { target: { value: '3' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Task/i }));
    });
    expect(mockAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Task',
        description: 'Details',
        estimatedPomodoros: 3,
      }),
    );
  });

  it('removes last tag when Backspace is pressed with empty tag input', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    const tagInput = screen.getByPlaceholderText(/Comma/);
    fireEvent.change(tagInput, { target: { value: 'first' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.change(tagInput, { target: { value: 'second' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.getByText('second')).toBeInTheDocument();
    fireEvent.keyDown(tagInput, { key: 'Backspace' });
    expect(screen.getByText('first')).toBeInTheDocument();
    expect(screen.queryByText('second')).not.toBeInTheDocument();
  });

  it('does not add duplicate tag when same tag is entered again', () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    const tagInput = screen.getByPlaceholderText(/Comma/);
    fireEvent.change(tagInput, { target: { value: 'same' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    fireEvent.change(tagInput, { target: { value: 'same' } });
    fireEvent.keyDown(tagInput, { key: 'Enter' });
    const sameTags = screen.getAllByText('same');
    expect(sameTags).toHaveLength(1);
  });

  it('does not call addTask when form is submitted with empty title', async () => {
    render(<CreateTaskDialog isOpen={true} onClose={() => {}} />);
    const form = screen.getByRole('button', { name: /Create Task/i }).closest('form');
    expect(form).toBeInTheDocument();
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {});
      expect(mockAddTask).not.toHaveBeenCalled();
    }
  });
});
