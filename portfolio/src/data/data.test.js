// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { projects } from './projects';
import { skills } from './skills';
import { certs } from './certs';

const publicDir = fileURLToPath(new URL('../../public', import.meta.url));

describe('content data', () => {
  it('projects have no unused videoUrl field and use https links', () => {
    for (const p of projects) {
      expect(p).not.toHaveProperty('videoUrl');
      expect(p.title).toBeTruthy();
      expect(p.tech.length).toBeGreaterThan(0);
      for (const url of [p.liveUrl, p.github].filter(Boolean)) {
        expect(url).toMatch(/^https:\/\//);
      }
    }
  });

  it('lists NutriSage first and the Jokes app without a live link', () => {
    expect(projects[0].title).toBe('NutriSage');
    const jokes = projects.find((p) => p.title === 'Jokes PHP App');
    expect(jokes.liveUrl).toBeUndefined();
    expect(jokes.github).toBeTruthy();
  });

  it('skills have the six categories and no duplicates', () => {
    expect(Object.keys(skills)).toEqual([
      'frontend', 'cloudDevOps', 'engineering', 'backend', 'tools', 'softSkills',
    ]);
    const all = Object.values(skills).flat();
    expect(new Set(all).size).toBe(all.length);
    expect(all).toContain('PHP');
    for (const dropped of ['Angular', 'WebAssembly', 'Atlassian Suite', 'Microsoft Office']) {
      expect(all).not.toContain(dropped);
    }
  });

  it('certs are newest first and each badge image exists', () => {
    const parse = (s) => new Date(`1 ${s}`).getTime();
    const dates = certs.map((c) => parse(c.issueDate));
    expect([...dates].sort((a, b) => b - a)).toEqual(dates);
    for (const c of certs) {
      expect(existsSync(`${publicDir}${c.badgeUrl}`)).toBe(true);
      expect(c.credlyUrl).toMatch(/^https:\/\/www\.credly\.com\/badges\//);
    }
  });
});
