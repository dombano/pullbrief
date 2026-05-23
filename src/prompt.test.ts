import { buildPrompt } from './prompt';

describe('buildPrompt', () => {
  const baseDiff = '--- a/index.ts\n+++ b/index.ts\n@@ -1,3 +1,4 @@\n+const x = 1;';
  const baseCommits = '- abc1234: feat: initial commit';

  it('includes diff content in the prompt', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(prompt).toContain(baseDiff);
  });

  it('includes commit messages in the prompt', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(prompt).toContain(baseCommits);
  });

  it('contains instructions to summarize', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(prompt.toLowerCase()).toMatch(/summar|descri|pull request/);
  });

  it('returns a non-empty string', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(50);
  });

  it('handles empty diff gracefully', () => {
    const prompt = buildPrompt({ diff: '', commits: baseCommits });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('handles empty commits gracefully', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: '' });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('includes a section header for diff', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(prompt.toLowerCase()).toMatch(/diff|changes/);
  });

  it('includes a section header for commits', () => {
    const prompt = buildPrompt({ diff: baseDiff, commits: baseCommits });
    expect(prompt.toLowerCase()).toMatch(/commit/);
  });
});
