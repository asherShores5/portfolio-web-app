// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { CONTACT_ENDPOINT } from './config';

const file = fileURLToPath(new URL('../../customHttp.yml', import.meta.url));
const config = parse(readFileSync(file, 'utf8'));
const rule = config.customHeaders.find((r) => r.pattern === '**');
const headers = Object.fromEntries(rule.headers.map((h) => [h.key, String(h.value)]));

const directives = Object.fromEntries(
  headers['Content-Security-Policy']
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const [name, ...values] = d.split(/\s+/);
      return [name, values];
    })
);

describe('customHttp.yml', () => {
  it('applies to every path', () => {
    expect(rule).toBeDefined();
  });

  it('sets the browser security headers', () => {
    expect(headers['Strict-Transport-Security']).toBe('max-age=31536000');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
  });

  it('has the expected CSP directives', () => {
    expect(directives).toEqual({
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", new URL(CONTACT_ENDPOINT).origin],
      'frame-src': ['https://maps.google.com', 'https://www.google.com'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
    });
    for (const values of Object.values(directives)) {
      expect(values).not.toContain("'unsafe-inline'");
      expect(values).not.toContain("'unsafe-eval'");
    }
  });

  it('pins connect-src to exactly the contact endpoint (no wildcards)', () => {
    expect(directives['connect-src']).toEqual(["'self'", new URL(CONTACT_ENDPOINT).origin]);
    expect(headers['Content-Security-Policy']).not.toMatch(/\*/);
  });
});

describe('index.html under the CSP', () => {
  const html = readFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), 'utf8');

  it('has no inline scripts, styles or style attributes', () => {
    for (const tag of html.match(/<script\b[^>]*>/g) ?? []) {
      expect(tag).toMatch(/\ssrc=/);
    }
    expect(html).not.toMatch(/<style\b/);
    expect(html).not.toMatch(/\sstyle=/);
  });
});
