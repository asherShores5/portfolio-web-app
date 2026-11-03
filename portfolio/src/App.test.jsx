import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the intro heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /i'm asher shores/i })).toBeInTheDocument();
  });

  it('orders nav links to match the page sections', () => {
    const { container } = render(<App />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
      .slice(1, 7); // skip the brand link; desktop links come first
    const sectionIds = [...container.querySelectorAll('section')].map((s) => `#${s.id}`);
    expect(hrefs).toEqual(sectionIds);
    expect(sectionIds).toEqual(['#intro', '#skills', '#certifications', '#projects', '#connect', '#hire']);
  });

  it('gives every section a scroll margin for the fixed nav', () => {
    const { container } = render(<App />);
    for (const s of container.querySelectorAll('section')) {
      expect(s.className).toContain('scroll-mt-16');
    }
  });

  it('labels icon-only links and the profile photo', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'GitHub profile' })).toHaveAttribute('href', 'https://github.com/asherShores5');
    expect(screen.getByRole('link', { name: 'LinkedIn profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Email Asher' })).toHaveAttribute('href', 'mailto:asher.shores5@gmail.com');
    expect(screen.getByRole('img', { name: 'Photo of Asher Shores' })).toBeInTheDocument();
  });

  it('menu button exposes its state', async () => {
    render(<App />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    const close = screen.getByRole('button', { name: 'Close menu' });
    expect(close).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  });
});
