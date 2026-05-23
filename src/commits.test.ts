import { formatCommitsForPrompt } from './commits';

describe('formatCommitsForPrompt', () => {
  it('formats a single commit correctly', () => {
    const commits = [
      { sha: 'abc1234', message: 'feat: add login page' }
    ];
    const result = formatCommitsForPrompt(commits);
    expect(result).toContain('abc1234');
    expect(result).toContain('feat: add login page');
  });

  it('formats multiple commits in order', () => {
    const commits = [
      { sha: 'aaa0001', message: 'fix: resolve null pointer' },
      { sha: 'bbb0002', message: 'chore: update dependencies' },
      { sha: 'ccc0003', message: 'feat: add dark mode' }
    ];
    const result = formatCommitsForPrompt(commits);
    expect(result).toContain('aaa0001');
    expect(result).toContain('bbb0002');
    expect(result).toContain('ccc0003');
    const idx1 = result.indexOf('aaa0001');
    const idx2 = result.indexOf('bbb0002');
    const idx3 = result.indexOf('ccc0003');
    expect(idx1).toBeLessThan(idx2);
    expect(idx2).toBeLessThan(idx3);
  });

  it('returns a placeholder when commits array is empty', () => {
    const result = formatCommitsForPrompt([]);
    expect(result).toMatch(/no commits|empty/i);
  });

  it('truncates very long commit messages', () => {
    const longMessage = 'a'.repeat(300);
    const commits = [{ sha: 'def5678', message: longMessage }];
    const result = formatCommitsForPrompt(commits);
    expect(result.length).toBeLessThan(400);
  });

  it('strips newlines from commit messages', () => {
    const commits = [
      { sha: 'ffe9999', message: 'fix: broken\nstuff\nhere' }
    ];
    const result = formatCommitsForPrompt(commits);
    const lines = result.split('\n').filter(l => l.includes('ffe9999'));
    expect(lines.length).toBe(1);
  });
});
