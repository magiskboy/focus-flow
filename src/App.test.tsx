import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders dashboard', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});
