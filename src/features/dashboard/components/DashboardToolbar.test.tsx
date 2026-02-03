import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardToolbar } from './DashboardToolbar';

describe('DashboardToolbar', () => {
  it('renders Dashboard title and Add Task button', () => {
    render(<DashboardToolbar searchQuery='' onSearchChange={() => {}} onAddTaskClick={() => {}} />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(<DashboardToolbar searchQuery='' onSearchChange={() => {}} onAddTaskClick={() => {}} />);
    expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument();
  });

  it('calls onAddTaskClick when Add Task is clicked', () => {
    const onAddTaskClick = vi.fn();
    render(
      <DashboardToolbar searchQuery='' onSearchChange={() => {}} onAddTaskClick={onAddTaskClick} />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }));
    expect(onAddTaskClick).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchChange when search input changes', () => {
    const onSearchChange = vi.fn();
    render(
      <DashboardToolbar searchQuery='' onSearchChange={onSearchChange} onAddTaskClick={() => {}} />,
    );
    const searchInput = screen.getByPlaceholderText(/Search tasks/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(onSearchChange).toHaveBeenCalledWith('test query');
  });
});
