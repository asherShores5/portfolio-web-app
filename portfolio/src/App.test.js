import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the intro heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /i'm asher shores/i });
  expect(heading).toBeInTheDocument();
});
