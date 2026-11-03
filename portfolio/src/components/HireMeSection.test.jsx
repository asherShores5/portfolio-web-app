import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HireMeSection } from './HireMeSection';
import { CONTACT_ENDPOINT } from '../config';

const fillAndSubmit = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Name'), 'Test Person');
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Message'), 'Hello there');
  await user.click(screen.getByRole('button', { name: /send message/i }));
};

const mockFetch = (response) => {
  const fn = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fn);
  return fn;
};

describe('HireMeSection', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts the form with an empty honeypot and shows success', async () => {
    const fetchFn = mockFetch(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    render(<HireMeSection />);
    await fillAndSubmit();

    expect(fetchFn).toHaveBeenCalledWith(CONTACT_ENDPOINT, expect.objectContaining({ method: 'POST' }));
    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body).toEqual({
      name: 'Test Person',
      email: 'test@example.com',
      message: 'Hello there',
      website: '',
    });
    expect(await screen.findByRole('status')).toHaveTextContent('Message sent successfully!');
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows the rate-limit message on 429', async () => {
    mockFetch(new Response(JSON.stringify({ message: 'slow down' }), { status: 429 }));
    render(<HireMeSection />);
    await fillAndSubmit();
    expect(await screen.findByRole('status')).toHaveTextContent(/too many messages today/i);
  });

  it('shows a generic message on a non-JSON 502', async () => {
    mockFetch(new Response('<html>Bad Gateway</html>', { status: 502 }));
    render(<HireMeSection />);
    await fillAndSubmit();
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/something went wrong/i);
    expect(status).toHaveTextContent('asher.shores5@gmail.com');
  });

  it('shows a generic message on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    render(<HireMeSection />);
    await fillAndSubmit();
    expect(await screen.findByRole('status')).toHaveTextContent(/something went wrong/i);
  });

  it('hides the honeypot from keyboard and assistive tech', () => {
    render(<HireMeSection />);
    const hp = document.getElementById('contact-website');
    expect(hp).toHaveAttribute('name', 'website');
    expect(hp).toHaveAttribute('tabindex', '-1');
    expect(hp).toHaveAttribute('autocomplete', 'off');
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
